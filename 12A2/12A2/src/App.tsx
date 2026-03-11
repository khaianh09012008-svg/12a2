import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Counter from './Counter';
import { TUNNEL_POLAROIDS, BOARD_ASSETS } from './album';

export default function App() {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const hashtagLayerRef = useRef<HTMLDivElement>(null);
  const vortexLayerRef = useRef<HTMLDivElement>(null);
  const videosLayerRef = useRef<HTMLDivElement>(null);
  const videoContainersRef = useRef<(HTMLDivElement | null)[]>([]);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
  const streaksRef = useRef<(HTMLDivElement | null)[]>([]);
  const flyingPhotosRef = useRef<(HTMLDivElement | null)[]>([]);
  const spiralsRef = useRef<(HTMLDivElement | null)[]>([]);

  const scaleRef = useRef(0.01);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const targetScaleRef = useRef(0.01);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const [mode, setMode] = useState<'OUTSIDE' | 'INSIDE'>('OUTSIDE');
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const isResettingRef = useRef(false);
  const isAutoZoomingRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const introProgressRef = useRef(0);
  const isIntroActiveRef = useRef(true);

  const LoadingScreen = ({ onComplete, onLoad100 }: { onComplete: () => void, onLoad100: () => void }) => {
    const [count, setCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const hasTriggered100 = useRef(false);

    useEffect(() => {
      const timer = setInterval(() => {
        setCount(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            if (!hasTriggered100.current) {
              hasTriggered100.current = true;
              onLoad100();
            }
            setTimeout(() => setIsFinished(true), 4500);
            return 100;
          }
          const inc = Math.random() * 1.8 + 0.2;
          return Math.min(prev + inc, 100);
        });
      }, 60);
      return () => clearInterval(timer);
    }, [onLoad100]);

    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={isFinished ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        onAnimationComplete={() => isFinished && onComplete()}
        className="fixed inset-0 z-[8000] bg-black flex flex-col justify-end p-1 pointer-events-none"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: count >= 100 ? 0 : 1 }}
          transition={{ duration: 1.2, delay: count >= 100 ? 0.2 : 0.2 }}
          className="relative overflow-hidden"
        >
          {/* Top fade overlay with blur to hide rolling digits */}
          <div className="absolute top-0 left-0 w-full h-[15%] bg-gradient-to-b from-black via-black/50 to-transparent z-10 pointer-events-none backdrop-blur-[2px]" />
          
          <Counter
            value={count}
            fontSize="15vw"
            textColor={count >= 100 ? "white" : "rgba(255,255,255,0.3)"}
            fontWeight={900}
          />
        </motion.div>
      </motion.div>
    );
  };

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const transitionTimeoutRef = useRef(0);

  const ENTER_SCALE = 0.15;
  const EXIT_SCALE = 0.13;

  const hashWords = [
    '#A2k28', '#Peak', '#Loptoiiu', '#Chv@2018', '#Qa', '#mamatrang', '#DaDiNang', '#TopGDTH', '#MAINVOCAL', '#hvnhungmuanho',
    '#toananhdianhatsu', '#truanayangimom?', '#Olympia', '#CanquetCLB', '#Dethuongs1', '#Quyluathoangkim', '#PapaKhang', '#ANHHAISAYTRAI', '#EMXINHANHHAI', '#PapaSuyen', '#Nhinho'
  ];

  const videosData = [
    { id: 1, src: '/photo/V1.mp4', width: '25vw', height: '14vw', top: '20%', left: '20%', delay: 0.1 },
    { id: 2, src: '/phto/V2.mp4', width: '28vw', height: '16vw', top: '40%', left: '70%', delay: 0.15 },
    { id: 3, src: '/photo/19_11/video.mp4', width: '24vw', height: '13vw', top: '70%', left: '30%', delay: 0.2 },
    { id: 4, src: '/photo/V3.mp4', width: '30vw', height: '17vw', top: '15%', left: '80%', delay: 0.25 },
    { id: 5, src: '/photo/V4.mp4', width: '26vw', height: '15vw', top: '55%', left: '10%', delay: 0.3 },
  ];

  const toggleView = () => {
    if (mode === 'OUTSIDE') {
      isAutoZoomingRef.current = true;
    } else {
      isResettingRef.current = true;
      setIsResetting(true);
    }
  };

  const handleResetComplete = () => {
    // Reset all internal states and refs
    scaleRef.current = 0.01;
    targetScaleRef.current = 0.01;
    currentXRef.current = 0;
    targetXRef.current = 0;
    currentYRef.current = 0;
    targetYRef.current = 0;
    setMode('OUTSIDE');
    setIsHeaderOpen(false);
    setIsFooterOpen(false);
    isResettingRef.current = false;
    setIsResetting(false);
    hasEnteredRef.current = false;
    introProgressRef.current = 0;
    isIntroActiveRef.current = true;
    setIsLoading(true); // Re-trigger loading screen
  };

  const isFirstMount = useRef(true);

  useEffect(() => {
    // Re-initialize the "outside" layers to ensure they are "fresh" 
    // when the user is at the board or when we just reset.
    initHashtags();
    initVortex();
  }, [mode]);

  useEffect(() => {
    let rafId: number;
    const animate = () => {
      // Handle guided auto-zoom
      if (isAutoZoomingRef.current) {
        if (targetScaleRef.current < ENTER_SCALE + 0.05) {
          targetScaleRef.current += 0.0015; // Moderate speed for guided tour
        } else {
          isAutoZoomingRef.current = false;
        }
      }

      // Smoothly interpolate values
      const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
      
      scaleRef.current = lerp(scaleRef.current, targetScaleRef.current, 0.1);
      currentXRef.current = lerp(currentXRef.current, targetXRef.current, 0.15);
      currentYRef.current = lerp(currentYRef.current, targetYRef.current, 0.15);

      // Snap to target if close enough
      if (Math.abs(scaleRef.current - targetScaleRef.current) < 0.00001) scaleRef.current = targetScaleRef.current;
      if (Math.abs(currentXRef.current - targetXRef.current) < 0.01) currentXRef.current = targetXRef.current;
      if (Math.abs(currentYRef.current - targetYRef.current) < 0.01) currentYRef.current = targetYRef.current;

      updateTransform();
      
      // Handle mode transitions based on actual scale
      if (mode === 'OUTSIDE' && scaleRef.current > ENTER_SCALE) {
        setMode('INSIDE');
        transitionTimeoutRef.current = Date.now() + 600;
      } else if (mode === 'INSIDE' && scaleRef.current < EXIT_SCALE) {
        if (!isResettingRef.current) {
          isResettingRef.current = true;
          setIsResetting(true);
          // Lock scale to prevent "jumping" during curtain close
          targetScaleRef.current = scaleRef.current;
        }
      }

      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const initVortex = () => {
    if (!vortexLayerRef.current) return;
    vortexLayerRef.current.innerHTML = '';
    
    // Create streaks
    const colors = ['rgba(100, 200, 255, 0.8)', 'rgba(255, 255, 255, 1)', 'rgba(150, 255, 255, 0.8)', 'rgba(200, 200, 255, 0.6)'];
    for (let i = 0; i < 60; i++) {
      const streak = document.createElement('div');
      streak.className = 'vortex-streak';
      const angle = Math.random() * 360;
      const dist = 50 + Math.random() * 250;
      const speed = 0.4 + Math.random() * 1.8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      streak.setAttribute('data-speed', speed.toString());
      streak.style.background = `linear-gradient(to bottom, transparent, ${color}, transparent)`;
      streak.style.transform = `rotate(${angle}deg) translateY(${dist}px)`;
      streak.style.opacity = '0';
      vortexLayerRef.current.appendChild(streak);
      streaksRef.current[i] = streak;
    }

    // Create flying photos
    TUNNEL_POLAROIDS.forEach((data, i) => {
      const photo = document.createElement('div');
      photo.className = 'flying-photo';
      photo.innerHTML = `
        <div class="polaroid-frame">
          <img src="${data.url}" referrerPolicy="no-referrer" />
          ${data.caption ? `<div class="polaroid-caption">${data.caption}</div>` : ''}
        </div>
      `;
      vortexLayerRef.current?.appendChild(photo);
      flyingPhotosRef.current[i] = photo;
      // Store data in attributes for easy access in updateTransform
      const delay = Math.random() * 0.8;
      const angle = Math.random() * 360;
      photo.setAttribute('data-delay', delay.toString());
      photo.setAttribute('data-angle', angle.toString());
    });

    // Create spirals
    for (let i = 0; i < 4; i++) {
      const spiral = document.createElement('div');
      spiral.className = 'vortex-spiral';
      spiral.style.transform = `translate(-50%, -50%) rotate(${i * 90}deg)`;
      vortexLayerRef.current.appendChild(spiral);
      spiralsRef.current[i] = spiral;
    }
  };

  const initHashtags = () => {
    if (!hashtagLayerRef.current) return;
    hashtagLayerRef.current.innerHTML = '';
    
    const patterns = [
      ['L', 'R', 'L', 'R', 'L'],
      ['R', 'L', 'R', 'L', 'R'],
      ['L', 'L', 'R', 'R', 'L'],
      ['R', 'R', 'L', 'L', 'R'],
      ['L', 'R', 'R', 'L', 'L'],
      ['R', 'L', 'L', 'R', 'R'],
      ['L', 'L', 'R', 'L', 'R'],
      ['R', 'R', 'L', 'R', 'L'],
      ['L', 'R', 'L', 'L', 'R'],
    ];
    const chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];

    for (let i = 0; i < 5; i++) {
      // Create a long string of randomized words for each row to ensure maximum variety
      let rowWords = [];
      for (let k = 0; k < 40; k++) {
        rowWords.push(hashWords[Math.floor(Math.random() * hashWords.length)]);
      }
      const repeatString = rowWords.join('');

      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.willChange = 'transform';
      wrapper.className = 'hashtag-row-wrapper';

      const row = document.createElement('div');
      const isRight = chosenPattern[i] === 'R';
      const direction = isRight ? 'scroll-right' : 'scroll-left';
      row.className = `marquee-row ${direction} intro-paused`;
      row.setAttribute('data-dir', chosenPattern[i]);
      
      // If entering from left (scroll-right), use RTL to make the "head" of the text enter first
      if (isRight) {
        row.style.direction = 'rtl';
      }
      
      row.style.animationDuration = `${600 + Math.random() * 300}s`;
      row.innerHTML = `<span>${repeatString}</span><span>${repeatString}</span>`;
      
      wrapper.appendChild(row);
      hashtagLayerRef.current.appendChild(wrapper);
    }
  };

  const handleLoad100 = () => {
    // Small delay to let the number 100 fade out first
    setTimeout(() => {
      isIntroActiveRef.current = true;
      introProgressRef.current = 0;
      
      const animateIntro = () => {
        if (introProgressRef.current < 1) {
          // Fast start, slow middle (khựng), then finish
          let step = 0.004; // Further reduced from 0.008
          if (introProgressRef.current > 0.4 && introProgressRef.current < 0.7) {
            step = 0.001; // Further reduced from 0.002
          } else if (introProgressRef.current >= 0.7) {
            step = 0.003; // Further reduced from 0.006
          }
          
          introProgressRef.current += step;
          if (introProgressRef.current > 1) introProgressRef.current = 1;
          requestAnimationFrame(animateIntro);
        }
      };
      animateIntro();
    }, 500);
  };

  const updateTransform = () => {
    if (!whiteboardRef.current) return;

    const scale = scaleRef.current;
    const currentX = currentXRef.current;
    const currentY = currentYRef.current;

    const boardWidthHalf = (window.innerWidth * 4) / 2;
    const boardHeightHalf = (window.innerHeight * 4) / 2;
    const viewWidthHalf = window.innerWidth / 2;
    const viewHeightHalf = window.innerHeight / 2;

    const margin = 40; 

    let limitX = Math.max(0, (boardWidthHalf * scale) - viewWidthHalf + margin);
    let limitY = Math.max(0, (boardHeightHalf * scale) - viewHeightHalf + margin);

    const newX = Math.max(-limitX, Math.min(limitX, currentX));
    const newY = Math.max(-limitY, Math.min(limitY, currentY));

    if (newX !== currentX) currentXRef.current = newX;
    if (newY !== currentY) currentYRef.current = newY;

    if (scale > 0.5) hasEnteredRef.current = true;

    // Eye blurring effect: only if we have entered the board and are now zooming out below EXIT_SCALE
    let blurVal = 0;
    if (hasEnteredRef.current && scale < EXIT_SCALE) {
      // Scale goes from EXIT_SCALE (0.13) down to 0.01
      // We want blur to go from 0 to 20
      const p = (EXIT_SCALE - scale) / (EXIT_SCALE - 0.01);
      blurVal = p * 20;
    }
    // If resetting is active, ensure a minimum blur
    if (isResettingRef.current) blurVal = Math.max(blurVal, 15);

    whiteboardRef.current.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) scale(${scale})`;
    whiteboardRef.current.style.filter = blurVal > 0 ? `blur(${blurVal.toFixed(1)}px)` : 'none';
    
    if (mode === 'OUTSIDE') {
      let p = (scale - 0.01) / (ENTER_SCALE - 0.01);
      p = Math.max(0, Math.min(p, 1));

      const hashtagLayer = hashtagLayerRef.current;
      if (hashtagLayer) {
        const hashP = Math.min(p / 0.25, 1); 
        const isVisible = hashP < 1;
        
        if (isVisible) {
          if (hashtagLayer.style.display !== 'flex') hashtagLayer.style.display = 'flex';
          const rows = hashtagLayer.children;
          const introP = introProgressRef.current;

          for (let i = 0; i < rows.length; i++) {
            const rowWrapper = rows[i] as HTMLElement;
            const row = rowWrapper.querySelector('.marquee-row');
            const dir = row?.getAttribute('data-dir') || (i % 2 === 0 ? 'L' : 'R');
            
            // Base zoom offset
            const direction = (i % 2 === 0) ? -1 : 1;
            let offsetX = hashP * 180 * direction;
            let offsetY = hashP * 20 * (i - 2); 

            // Intro slide-in offset
            let introOpacity = 1;
            if (isIntroActiveRef.current && introP < 1) {
              // Custom easing for "slam and pause"
              let slideP = 0;
              if (introP < 0.5) {
                // Fast slam in from 100% to 0% offset
                slideP = Math.pow(1 - (introP / 0.5), 3);
              } else {
                // Stay at 0 offset (khựng lại)
                slideP = 0;
                
                // Unpause this specific marquee row once we've slammed in
                if (row && row.classList.contains('intro-paused')) {
                  row.classList.remove('intro-paused');
                }
              }

              const introOffsetX = dir === 'L' ? slideP * 150 : slideP * -150;
              offsetX += introOffsetX;
              
              // Add a subtle fade-in during the slam phase
              introOpacity = Math.min(1, (1 - slideP) * 1.5);
            }

            rowWrapper.style.transform = `translate(${offsetX}vw, ${offsetY}vh)`;
            rowWrapper.style.opacity = introOpacity.toString();
          }
          
          if (hashP > 0.33) {
            const holeP = (hashP - 0.33) / 0.67;
            const holeStart = Math.pow(holeP, 2) * 150; 
            hashtagLayer.style.setProperty('--hole-start', `${holeStart.toFixed(2)}%`);
            hashtagLayer.style.setProperty('--hole-end', `${(holeStart + 25).toFixed(2)}%`);
          } else {
            hashtagLayer.style.setProperty('--hole-start', '0%');
            hashtagLayer.style.setProperty('--hole-end', '0%');
          }
          
          let layerOpacity = p < 0.05 ? 1 : (1 - hashP);
          if (isIntroActiveRef.current && introP < 1) {
            layerOpacity *= Math.min(introP * 2, 1);
          }
          hashtagLayer.style.opacity = layerOpacity.toFixed(3);
          hashtagLayer.style.filter = blurVal > 0 ? `blur(${blurVal.toFixed(1)}px)` : (hashP > 0.1 ? `blur(${Math.round(hashP * 10)}px)` : 'none');
          hashtagLayer.style.transform = `scale(${(1 + hashP * 0.5).toFixed(3)})`; 
        } else {
          if (hashtagLayer.style.display !== 'none') hashtagLayer.style.display = 'none';
        }
      }

      const vortexLayer = vortexLayerRef.current;
      if (vortexLayer) {
        const VORTEX_START = 0; 
        const VORTEX_END = 0.99;   
        const isVisible = p < VORTEX_END;
        
        if (isVisible) {
          if (vortexLayer.style.display !== 'block') vortexLayer.style.display = 'block';
          const vortexP = (p - VORTEX_START) / (VORTEX_END - VORTEX_START);
          const layerOpacity = p > 0.8 ? (1 - p) / 0.2 : 1;
          vortexLayer.style.opacity = layerOpacity.toFixed(3);
          vortexLayer.style.filter = blurVal > 0 ? `blur(${blurVal.toFixed(1)}px)` : 'none';

          if (p < 0.08) {
            vortexLayer.style.setProperty('--hole-size', '0%');
            vortexLayer.style.setProperty('--feather', '0%');
          } else {
            const holeP = (p - 0.08) / 0.91;
            const holeSize = holeP * 120; 
            const feather = 15 + (holeP * 25);
            vortexLayer.style.setProperty('--hole-size', `${holeSize.toFixed(2)}%`);
            vortexLayer.style.setProperty('--feather', `${(holeSize + feather).toFixed(2)}%`);
          }
          
          const vortexP_for_glow = Math.max(0, (p - 0.05) / 0.94);
          const glowSize = 50 + (vortexP_for_glow * 800);
          vortexLayer.style.setProperty('--glow-size', `${Math.round(glowSize)}px`);

          spiralsRef.current.forEach((spiral, i) => {
            if (!spiral) return;
            const rotation = (i * 90) + (p * 720); 
            const s = 0.5 + (p * 2);
            spiral.style.transform = `translate(-50%, -50%) rotate(${rotation.toFixed(1)}deg) scale(${s.toFixed(3)})`;
            spiral.style.opacity = (p < 0.1 ? p / 0.1 : (p > 0.8 ? (1 - p) / 0.2 : 1)).toFixed(3);
          });

          streaksRef.current.forEach((streak, i) => {
            if (!streak) return;
            const speed = parseFloat(streak.getAttribute('data-speed') || '1');
            const angleBase = (i / 60) * 360;
            const rotation = angleBase + (p * 1440 * speed); 
            const dist = 20 + (p * 2500 * speed); 
            streak.style.transform = `rotate(${rotation.toFixed(1)}deg) translateY(${dist.toFixed(1)}px)`;
            streak.style.opacity = (p < 0.1 ? p / 0.1 : (p > 0.85 ? (1 - p) / 0.15 : 1)).toFixed(3);
          });

          flyingPhotosRef.current.forEach((photo, i) => {
            if (!photo) return;
            const delay = parseFloat(photo.getAttribute('data-delay') || '0');
            const angleBase = parseFloat(photo.getAttribute('data-angle') || '0');
            
            let photoP = 0;
            if (p > delay) {
              photoP = Math.min((p - delay) / 0.4, 1);
            }

            if (photoP > 0) {
              const spiralSpeed = 2.5;
              const angle = angleBase + (photoP * 360 * spiralSpeed);
              const dist = photoP * 250; 
              const s = photoP * 6;
              const opacity = photoP < 0.1 ? photoP / 0.1 : (photoP > 0.85 ? (1 - photoP) / 0.15 : 1);
              
              const x = Math.cos(angle * Math.PI / 180) * dist;
              const y = Math.sin(angle * Math.PI / 180) * dist;

              photo.style.transform = `translate(calc(-50% + ${x.toFixed(1)}vw), calc(-50% + ${y.toFixed(1)}vh)) scale(${s.toFixed(3)}) rotate(${(angle / 2).toFixed(1)}deg)`;
              photo.style.opacity = Math.max(0, opacity).toFixed(3);
            } else {
              photo.style.opacity = '0';
            }
          });
        } else {
          if (vortexLayer.style.display !== 'none') vortexLayer.style.display = 'none';
        }
      }

      const videosLayer = videosLayerRef.current;
      if (videosLayer) {
        const TRIGGER_START = 0.1;
        const TRIGGER_END = 0.9;
        const isVisible = p > TRIGGER_START && p < TRIGGER_END;
        
        if (isVisible) {
          if (videosLayer.style.display !== 'flex') videosLayer.style.display = 'flex';
          const videoFlyP = (p - TRIGGER_START) / (TRIGGER_END - TRIGGER_START);
          
          videoContainersRef.current.forEach((el, idx) => {
            if (!el) return;
            const data = videosData[idx];
            const video = videosRef.current[idx];
            const startX = idx % 2 === 0 ? -100 : 100;
            const startY = idx % 3 === 0 ? -100 : 100;
            
            let individualP = 0;
            if (videoFlyP > data.delay) {
              individualP = Math.min((videoFlyP - data.delay) / 0.4, 1);
            }

            const currentX = startX + (individualP * -startX * 2);
            const currentY = startY + (individualP * -startY * 2);
            const currentScale = 0.5 + (individualP * 2);
            const currentOpacity = individualP < 0.2 ? individualP / 0.2 : (individualP > 0.8 ? (1 - individualP) / 0.2 : 1);

            el.style.transform = `translate(calc(-50% + ${currentX.toFixed(1)}vw), calc(-50% + ${currentY.toFixed(1)}vh)) scale(${currentScale.toFixed(3)})`;
            el.style.opacity = Math.max(0, currentOpacity).toFixed(3);
            
            if (individualP > 0.1 && individualP < 0.9) {
              if (video && video.paused) video.play().catch(() => {});
            } else {
              if (video && !video.paused) video.pause();
            }
          });
        } else {
          if (videosLayer.style.display !== 'none') {
            videosLayer.style.display = 'none';
            videosRef.current.forEach(v => v && v.pause());
          }
        }
      }

      whiteboardRef.current.style.boxShadow = "0 100px 200px rgba(0,0,0,0.3)";
    } else {
      if (hashtagLayerRef.current) hashtagLayerRef.current.style.display = 'none';
      if (vortexLayerRef.current) vortexLayerRef.current.style.display = 'none';
      if (videosLayerRef.current) {
        videosLayerRef.current.style.display = 'none';
        videosRef.current.forEach(v => v && v.pause());
      }
      
      whiteboardRef.current.style.boxShadow = "0 50px 100px rgba(0,0,0,0.6)"; 
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    // Stop auto-zooming if user manually scrolls
    isAutoZoomingRef.current = false;

    const now = Date.now();
    if (now < transitionTimeoutRef.current) return;

    if (mode === 'OUTSIDE') {
      let factor;
      if (e.ctrlKey) {
        factor = Math.pow(1.1, -e.deltaY / 120);
      } else {
        factor = Math.pow(1.1, e.deltaY / 120);
      }
      
      targetScaleRef.current = Math.min(Math.max(targetScaleRef.current * factor, 0.005), 3.0);
    } 
    else if (mode === 'INSIDE') {
      if (e.ctrlKey) {
        const factor = Math.pow(1.1, -e.deltaY / 120);
        targetScaleRef.current = Math.min(Math.max(targetScaleRef.current * factor, 0.005), 3.0);
      } else {
        targetXRef.current -= e.deltaX;
        targetYRef.current -= e.deltaY;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || mode === 'OUTSIDE') return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - targetXRef.current;
    startYRef.current = e.pageY - targetYRef.current;
    if (whiteboardRef.current) whiteboardRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (mode === 'INSIDE' && whiteboardRef.current) whiteboardRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || mode === 'OUTSIDE') return;
    const newX = e.pageX - startXRef.current;
    const newY = e.pageY - startYRef.current;
    targetXRef.current = newX;
    targetYRef.current = newY;
  };

  useEffect(() => {
    const handleResize = () => updateTransform();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mouseup', handleMouseUp);
    
    const wrapper = boardWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      if (wrapper) {
        wrapper.removeEventListener('wheel', handleWheel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="w-full h-full overflow-hidden bg-white font-patrick selection:bg-black selection:text-white">
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} onLoad100={handleLoad100} />}
      </AnimatePresence>

      {/* Reset Transition Curtain (Eye Closing) */}
      <AnimatePresence>
        {isResetting && (
          <div className="fixed inset-0 z-[7000] pointer-events-none flex flex-col justify-between">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '51%' }}
              exit={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1] }}
              onAnimationComplete={() => isResetting && handleResetComplete()}
              className="w-full bg-black pointer-events-auto border-b border-white/5"
            />
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '51%' }}
              exit={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: [0.7, 0, 0.3, 1] }}
              className="w-full bg-black pointer-events-auto border-t border-white/5"
            />
          </div>
        )}
      </AnimatePresence>

      {/* HEADER (PROVIDED) */}
      <header className={`site-header ${!isHeaderOpen ? 'hidden-header' : ''}`}>
        <a href="#" className="header-logo">
          <div className="header-logo-img" style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary-color)' }}>
            A2<span style={{ color: '#3b82f6' }}>K28</span>
          </div>
        </a>
        <nav className="main-nav">
          <a href="https://boulevardphat.github.io/grade10/" className="nav-link">Lớp 10</a>
          <a href="https://luongminhtriet970.github.io/class11-aniversary/" className="nav-link">Lớp 11</a>
          <a href="#" className="nav-link" style={{ color: 'var(--primary-color)', fontWeight: 700, fontFamily: "'Lexend', sans-serif", letterSpacing: '0.05em' }}>Lớp 12</a>
          <a href="https://boulevardphat.github.io/members/" className="nav-link">Thành Viên</a>
          <a href="https://pgtomvn.github.io/teachers/" className="nav-link">Giáo Viên</a>
        </nav>
      </header>

      {/* HEADER TRIGGER ZONE */}
      <div className="ui-trigger-zone top">
        <button 
          className={`toggle-ui-btn ${isHeaderOpen ? 'active' : ''}`}
          onClick={() => setIsHeaderOpen(!isHeaderOpen)}
        >
          {isHeaderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {isHeaderOpen ? 'Ẩn Menu' : 'Hiện Menu'}
        </button>
      </div>

      <div 
        id="hashtag-layer" 
        ref={hashtagLayerRef}
        style={{ zIndex: (isLoading && isIntroActiveRef.current) ? 8100 : 150 }}
      ></div>
      <div id="vortex-layer" ref={vortexLayerRef}></div>

      {!isLoading && (
        <button id="go-to-btn" onClick={toggleView}>
          {mode === 'OUTSIDE' ? 'Đi tới' : 'Trở về'}
        </button>
      )}

      <div 
        id="board-wrapper" 
        ref={boardWrapperRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div id="whiteboard" ref={whiteboardRef} style={{ cursor: mode === 'INSIDE' ? 'grab' : 'default' }}>
          <div id="board-header">
            <h1 className="font-patrick">12A2 - Thanh xuân của chúng mình</h1>
          </div>
          
          {/* Board Assets from album.ts */}
          {BOARD_ASSETS.map((asset) => (
            <div 
              key={asset.id}
              className={`board-asset asset-${asset.type}`}
              onClick={() => {
                if (asset.link) {
                 window.location.href = asset.link
                }
              }}
              style={{
                left: `${asset.x}%`,
                top: `${asset.y}%`,
                width: asset.width,
                transform: `rotate(${asset.rotation || 0}deg)`,
                zIndex: asset.zIndex || 10,
                cursor: asset.link ? "pointer" : "default"
              }}
            >
              <img 
                src={asset.url} 
                alt="" 
                referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
      </div>

      <div id="videos-layer" ref={videosLayerRef} key={mode}>
        {videosData.map((vid, idx) => (
          <div 
            key={vid.id}
            className="video-pop-container"
            ref={el => { videoContainersRef.current[idx] = el; }}
            style={{ 
              width: vid.width, 
              height: vid.height, 
              top: vid.top, 
              left: vid.left,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <video 
              ref={el => { videosRef.current[idx] = el; }}
              src={vid.src} 
              loop 
              muted 
              playsInline
            />
          </div>
        ))}
      </div>

      {/* FOOTER (PROVIDED) */}
      <footer className={`site-footer ${!isFooterOpen ? 'hidden-footer' : ''}`}>
        <div className="footer-content">
          <div className="footer-column">
            <h3>VỀ CHÚNG TÔI</h3>
            <p className="footer-desc">
              Kỷ niệm thanh xuân rực rỡ của tập thể 12A2 K28. Nơi lưu giữ những khoảnh khắc không bao giờ quên.
            </p>
          </div>
          
          <div className="footer-column">
            <h3>LIÊN KẾT NHANH</h3>
            <ul className="footer-links">
              <li><a href="https://boulevardphat.github.io/grade10/">Lớp 10</a></li>
              <li><a href="https://luongminhtriet970.github.io/class11-aniversary/">Lớp 11</a></li>
              <li><a href="#" style={{ color: 'white', fontWeight: 700, fontFamily: "'Lexend', sans-serif", letterSpacing: '0.05em' }}>Lớp 12</a></li>
              <li><a href="https://boulevardphat.github.io/members/">Thành Viên</a></li>
              <li><a href="https://pgtomvn.github.io/teachers/">Giáo Viên</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>LIÊN HỆ</h3>
            <ul className="footer-links">
              <li><a href="#">Facebook: 12A2 - K28</a></li>
            </ul>
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '14px', fontWeight: 600 }}>Góp ý cho lớp:</h4>
              <textarea id="feedback-text" name="feedback" className="feedback-box" rows={3} placeholder="Nhập lời nhắn..."></textarea>
              <button id="submit-feedback" className="feedback-btn">Gửi</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2023 - 2026 12A2 K28. All rights reserved. Made with love.
        </div>
      </footer>

      {/* FOOTER TRIGGER ZONE */}
      <div className="ui-trigger-zone bottom">
        <button 
          className={`toggle-ui-btn ${isFooterOpen ? 'active' : ''}`}
          onClick={() => setIsFooterOpen(!isFooterOpen)}
        >
          {isFooterOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          {isFooterOpen ? 'Ẩn Thông Tin' : 'Hiện Thông Tin'}
        </button>
      </div>
    </div>
  );
}
