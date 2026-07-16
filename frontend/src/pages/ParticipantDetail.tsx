import React from 'react';
import { useParams } from 'react-router-dom';

export default function ParticipantDetail() {
  const { code } = useParams<{ code: string }>();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Katılımcı Detayı</h1>
      <p>Kod: {code}</p>
      <p>Detaylar yakında eklenecek.</p>
    </div>
  );
}
