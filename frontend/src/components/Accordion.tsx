import React, { useState } from 'react';
export default function Accordion({ title, children, onOpen }: { title: string, children: React.ReactNode, onOpen?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border rounded-lg mb-4 bg-white shadow-sm">
      <button onClick={() => { setIsOpen(!isOpen); if(!isOpen && onOpen) onOpen(); }} className="w-full flex justify-between p-4 font-bold text-gray-800">
        <span>{title}</span><span>{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="p-4 border-t bg-gray-50">{children}</div>}
    </div>
  );
}
