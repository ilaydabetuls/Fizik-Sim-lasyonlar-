from typing import List, Dict
import math

QUESTION_TOPICS = {
    "q1": "Düşey Atış ve İvme",
    "q2": "Eğik Atış ve Yörünge",
    "q3": "Newton'un İkinci Yasası ve Serbest Düşme"
}

def calculate_item_statistics(logs: List[Dict], total_participants: int):
    stats = {}
    sorted_scores = sorted(logs, key=lambda x: x.get('score', 0), reverse=True)
    group_size = max(1, math.ceil(total_participants * 0.27))
    upper_group = sorted_scores[:group_size]
    lower_group = sorted_scores[-group_size:]
    
    for q_id, topic in QUESTION_TOPICS.items():
        correct_count = sum(1 for p in logs if p.get('answers', {}).get(q_id, {}).get('isCorrect'))
        p_value = correct_count / total_participants if total_participants > 0 else 0
        
        upper_correct = sum(1 for p in upper_group if p.get('answers', {}).get(q_id, {}).get('isCorrect'))
        lower_correct = sum(1 for p in lower_group if p.get('answers', {}).get(q_id, {}).get('isCorrect'))
        
        p_upper = upper_correct / group_size if group_size > 0 else 0
        p_lower = lower_correct / group_size if group_size > 0 else 0
        d_value = p_upper - p_lower
        
        difficulty_level = "Orta"
        if p_value > 0.8: difficulty_level = "Çok Kolay"
        elif p_value > 0.6: difficulty_level = "Kolay"
        elif p_value < 0.2: difficulty_level = "Çok Zor"
        elif p_value < 0.4: difficulty_level = "Zor"
        
        stats[q_id] = {
            "topic": topic,
            "difficulty": p_value,
            "difficultyLevel": difficulty_level,
            "discrimination": d_value,
            "needsRevision": d_value < 0.2 
        }
    return stats

def generate_automated_insights(item_stats: Dict):
    if not item_stats: return ["Henüz yeterli veri bulunmamaktadır."]
    insights = []
    hardest_q = min(item_stats.items(), key=lambda x: x[1]['difficulty'])
    insights.append(f"En çok zorlanılan konu '{hardest_q[1]['topic']}' olmuştur (Başarı: %{hardest_q[1]['difficulty']*100:.0f}).")
    low_disc = [k for k, v in item_stats.items() if v['needsRevision']]
    if low_disc:
        insights.append(f"Ayırt ediciliği düşük (D < 0.2) olan şu soruların çeldiricileri revize edilmelidir: {', '.join(low_disc).upper()}")
    return insights
