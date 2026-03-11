import React from 'react';
import { motion } from 'motion/react';

interface DigitProps {
  digit: number;
  fontSize: number | string;
  textColor: string;
  fontWeight: number;
}

const Digit: React.FC<DigitProps> = ({ 
  digit, 
  fontSize, 
  textColor, 
  fontWeight 
}) => {
  return (
    <div 
      className="relative overflow-hidden inline-block font-mono"
      style={{ 
        height: '1.1em', 
        width: '0.6em', 
        fontSize: fontSize,
        color: textColor,
        fontWeight: fontWeight,
        lineHeight: 1
      }}
    >
      <motion.div
        animate={{ y: `-${digit * 10}%` }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="flex flex-col"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span 
            key={n} 
            className="flex items-center justify-center"
            style={{ height: '1.1em', width: '100%' }}
          >
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

interface CounterProps {
  value: number;
  fontSize?: string | number;
  textColor?: string;
  fontWeight?: number;
}

const Counter: React.FC<CounterProps> = ({ 
  value, 
  fontSize = '32vw', 
  textColor = 'white', 
  fontWeight = 900 
}) => {
  const roundedValue = Math.floor(value);
  const digits = roundedValue.toString().split('').map(Number);

  return (
    <div className="flex items-end justify-start leading-[0.8]">
      {digits.map((d, i) => (
        <Digit 
          key={`${digits.length}-${i}`} 
          digit={d} 
          fontSize={fontSize} 
          textColor={textColor} 
          fontWeight={fontWeight} 
        />
      ))}
    </div>
  );
};

export default Counter;
