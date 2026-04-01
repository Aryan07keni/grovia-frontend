import React from 'react';
import './FloatingGroceries.css';

const GROCERY_ITEMS = [
  { emoji: null, name: 'apple', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=80&h=80&fit=crop' },
  { emoji: null, name: 'banana', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=80&h=80&fit=crop' },
  { emoji: null, name: 'orange', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=80&h=80&fit=crop' },
  { emoji: null, name: 'tomato', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=80&h=80&fit=crop' },
  { emoji: null, name: 'carrot', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=80&h=80&fit=crop' },
  { emoji: null, name: 'grapes', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=80&h=80&fit=crop' },
  { emoji: null, name: 'broccoli', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=80&h=80&fit=crop' },
  { emoji: null, name: 'mango', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=80&h=80&fit=crop' },
  { emoji: null, name: 'milk', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80&h=80&fit=crop' },
  { emoji: null, name: 'bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&h=80&fit=crop' },
];

function FloatingGroceries() {
  return (
    <div className="floating-groceries" data-testid="floating-groceries">
      {GROCERY_ITEMS.map((item, index) => (
        <div key={index} className={`floating-item floating-item-${index}`} style={{
          left: `${(index * 10) % 90}%`,
          top: `${(index * 13 + 5) % 85}%`,
          animationDelay: `${index * 0.7}s`,
          animationDuration: `${6 + (index % 4) * 2}s`,
        }}>
          <img src={item.image} alt={item.name} className="floating-img" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

export default FloatingGroceries;
