'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import classNames from 'classnames';

const ScreenCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [steps, setSteps] = useState([]);
  const stepCounter = useRef(1);
  const clickDataRef = useRef(null);

  // A ref to hold the latest state for the beforeunload event.
  const latestStateRef = useRef({ steps: [], isCapturing: false, stepCounter: 1 });
  useEffect(() => {
    latestStateRef.current = { steps, isCapturing, stepCounter: stepCounter.current };
  }, [steps, isCapturing]);

  // Button classes for styling.
  const buttonClass = classNames({
    "inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors": true,
  });

  const captureButtonClass = classNames(buttonClass, {
    "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-500 hover:bg-red-100": isCapturing,
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700": !isCapturing,
  });

  const clearButtonClass = classNames(buttonClass, {
    "bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500 hover:bg-orange-100": true,
  });

  // Load persisted state only once on mount.
  useEffect(() => {
    const persistedSteps = JSON.parse(localStorage.getItem('screenCaptureSteps') || '[]');
    if (persistedSteps.length > 0) {
      setSteps(persistedSteps);
      // Set step counter based on the persisted steps.
      stepCounter.current = parseInt(localStorage.getItem('screenCaptureStepCounter'), 10)
        || (persistedSteps[persistedSteps.length - 1].step + 1);
    }
    const active = localStorage.getItem('screenCaptureActive') === 'true';
    setIsCapturing(active);

    // Listen for storage changes (e.g., if multiple tabs are open)
    const onStorageChange = (e) => {
      if (e.key === 'screenCaptureSteps') {
        const newSteps = JSON.parse(e.newValue || '[]');
        setSteps(newSteps);
      }
      if (e.key === 'screenCaptureActive') {
        const isActive = e.newValue === 'true';
        setIsCapturing(isActive);
      }
      if (e.key === 'screenCaptureStepCounter') {
        stepCounter.current = parseInt(e.newValue, 10) || stepCounter.current;
      }
    };
    window.addEventListener('storage', onStorageChange);

    // Attach beforeunload once to persist the current state.
    const handleBeforeUnload = () => {
      localStorage.setItem('screenCaptureSteps', JSON.stringify(latestStateRef.current.steps));
      localStorage.setItem('screenCaptureStepCounter', latestStateRef.current.stepCounter.toString());
      localStorage.setItem('screenCaptureActive', latestStateRef.current.isCapturing.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Track mouse position during capture
  useEffect(() => {
    if (isCapturing) {
      document.addEventListener('click', handleScreenClick, true);
      document.body.style.cursor = 'crosshair';
    } else {
      document.removeEventListener('click', handleScreenClick, true);
      document.body.style.cursor = 'auto';
    }

    return () => {
      document.removeEventListener('click', handleScreenClick, true);
      document.body.style.cursor = 'auto';
    };
  }, [isCapturing]);

  // Clear all saved state
  const handleClearState = useCallback(() => {
    setSteps([]);
    stepCounter.current = 1;
    setIsCapturing(false);
    localStorage.removeItem('screenCaptureSteps');
    localStorage.removeItem('screenCaptureStepCounter');
    localStorage.setItem('screenCaptureActive', 'false');
  }, []);

  // Start capturing without clearing previous steps.
  const handleStartCapture = useCallback(() => {
    setIsCapturing(true);
    localStorage.setItem('screenCaptureActive', 'true');
    // Use the stored counter if available; otherwise, default to 1.
    const storedCounter = parseInt(localStorage.getItem('screenCaptureStepCounter'), 10);
    if (storedCounter) {
      stepCounter.current = storedCounter;
    } else if (steps.length > 0) {
      stepCounter.current = steps[steps.length - 1].step + 1;
    } else {
      stepCounter.current = 1;
    }
  }, [steps]);

  // Stop capturing: generate the PPT, then clear state.
  const handleStopCapture = useCallback(async () => {
    console.log('Stopping capture, steps:', steps.length);
    setIsCapturing(false);
    localStorage.setItem('screenCaptureActive', 'false');
    
    // Use the latest steps from localStorage to ensure we have all captures
    const allSteps = JSON.parse(localStorage.getItem('screenCaptureSteps') || '[]');
    console.log('All steps from storage:', allSteps.length);
    
    if (allSteps.length > 0) {
      await generatePowerPoint(allSteps);
      // Clear state after download.
      handleClearState();
    } else {
      alert('No screenshots captured yet. Please capture at least one screenshot before downloading.');
    }
  }, [handleClearState]);

  const handleScreenClick = async (e) => {
    // Avoid capturing clicks on the capture/clear buttons
    if (e.target.closest('.capture-controls')) return;

    // Prevent the default action
    e.preventDefault();
    e.stopPropagation();

    try {
      // Store click data before screenshot
      clickDataRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        element: e.target,
        elementRect: e.target.getBoundingClientRect()
      };

      // Take screenshot after a brief delay
      await captureScreenshot();
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to capture screenshot. Please try again.');
    }
  };

  const captureScreenshot = async () => {
    const clickData = clickDataRef.current;
    if (!clickData) return;

    // Options for html2canvas with higher resolution
    const scale = 2; // Increase scale for higher resolution
    const html2canvasOptions = {
      useCORS: true,
      logging: false,
      scale: scale,
      width: window.innerWidth,
      height: window.innerHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      x: window.scrollX || 0,
      y: window.scrollY || 0,
      scrollX: 0,
      scrollY: 0
    };

    try {
      // Use html2canvas to capture the screenshot
      const canvas = await html2canvas(document.body, html2canvasOptions);

      // Convert to data URL with high quality
      const screenshotURL = canvas.toDataURL('image/png', 1.0);
      
      // Calculate click position relative to the image dimensions
      const clickX = clickData.clientX / window.innerWidth;
      const clickY = clickData.clientY / window.innerHeight;
      
      // Save the step with click coordinates as percentages
      const newStep = {
        step: stepCounter.current,
        image: screenshotURL,
        width: canvas.width,
        height: canvas.height,
        originalWidth: window.innerWidth,
        originalHeight: window.innerHeight,
        clickData: {
          x: clickData.clientX,
          y: clickData.clientY,
          xPercent: clickX, // Store as percentage for PPT positioning
          yPercent: clickY, // Store as percentage for PPT positioning
          element: clickData.element.tagName,
          text: clickData.element.innerText || clickData.element.value || ''
        }
      };

      setSteps(prevSteps => {
        const updated = [...prevSteps, newStep];
        localStorage.setItem('screenCaptureSteps', JSON.stringify(updated));
        return updated;
      });

      stepCounter.current += 1;
      localStorage.setItem('screenCaptureStepCounter', stepCounter.current.toString());

    } catch (error) {
      console.error('Error in capture process:', error);
      throw error;
    }
  };

  const generatePowerPoint = async (stepsToExport) => {
    try {
      console.log('Generating PowerPoint with steps:', stepsToExport.length);
      
      // Dynamically import PptxGenJS only when needed and only on the client
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      
      // Set default slide size (16:9 ratio)
      pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
      pptx.layout = 'LAYOUT_16x9';
      
      // Add title slide
      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: 'FFFFFF' };
      titleSlide.addText('User Guide', {
        x: 1,
        y: 2,
        w: 8,
        h: 1,
        fontSize: 36,
        color: '363636',
        bold: true,
        align: 'center'
      });
      titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
        x: 1,
        y: 3,
        w: 8,
        h: 0.5,
        fontSize: 14,
        color: '666666',
        align: 'center'
      });
      titleSlide.addText(`Total Steps: ${stepsToExport.length}`, {
        x: 1,
        y: 3.5,
        w: 8,
        h: 0.5,
        fontSize: 14,
        color: '666666',
        align: 'center'
      });
      
      // Add each screenshot as a slide
      for (const step of stepsToExport) {
        const slide = pptx.addSlide();
        slide.background = { color: 'F5F5F5' };
        
        // Calculate aspect ratio and fit image to slide
        const imgAspectRatio = (step.originalWidth || step.width || 16) / (step.originalHeight || step.height || 9);
        const slideAspectRatio = 10 / 5.625;
        
        let imgWidth, imgHeight, imgX, imgY;
        
        if (imgAspectRatio > slideAspectRatio) {
          // Image is wider than slide
          imgWidth = 9.5;
          imgHeight = 9.5 / imgAspectRatio;
          imgX = 0.25;
          imgY = (5.625 - imgHeight) / 2;
        } else {
          // Image is taller than slide
          imgHeight = 5.125;
          imgWidth = 5.125 * imgAspectRatio;
          imgX = (10 - imgWidth) / 2;
          imgY = 0.25;
        }
        
        // Add the image with proper sizing
        slide.addImage({
          data: step.image,
          x: imgX,
          y: imgY,
          w: imgWidth,
          h: imgHeight
        });
        
        // Calculate arrow position based on click coordinates
        if (step.clickData && step.clickData.xPercent !== undefined && step.clickData.yPercent !== undefined) {
          // Convert percentage click position to slide coordinates
          const clickX = imgX + (imgWidth * step.clickData.xPercent);
          const clickY = imgY + (imgHeight * step.clickData.yPercent);
          
          // Arrow properties
          const arrowLength = 0.7; // Length of arrow shaft
          const arrowAngle = -45; // Angle in degrees
          const arrowAngleRad = arrowAngle * (Math.PI / 180);
          
          // Calculate arrow start position (tail)
          const arrowStartX = clickX + Math.cos(arrowAngleRad) * arrowLength;
          const arrowStartY = clickY + Math.sin(arrowAngleRad) * arrowLength;
          
          // Draw arrow using line shape
          slide.addShape(pptx.ShapeType.line, {
            x: arrowStartX,
            y: arrowStartY,
            w: Math.abs(clickX - arrowStartX),
            h: Math.abs(clickY - arrowStartY),
            line: { 
              color: 'FF0000', 
              width: 3,
              endArrowType: 'triangle'
            },
            flipH: clickX < arrowStartX,
            flipV: clickY < arrowStartY
          });
          
          // Add a small circle at the click point
          slide.addShape(pptx.ShapeType.ellipse, {
            x: clickX - 0.05,
            y: clickY - 0.05,
            w: 0.1,
            h: 0.1,
            fill: { color: 'FF0000' },
            line: { color: 'FFFFFF', width: 2 }
          });
          
          // Add step number near the arrow with background
          const textBoxX = arrowStartX + 0.1;
          const textBoxY = arrowStartY - 0.1;
          
          slide.addShape(pptx.ShapeType.rect, {
            x: textBoxX,
            y: textBoxY - 0.5,
            w: 1.5,
            h: 0.6,
            fill: { color: 'FFFFFF' },
            line: { color: 'FF0000', width: 2 },
            shadow: {
              type: 'outer',
              color: '000000',
              opacity: 0.3,
              offset: 2,
              blur: 4
            }
          });
          
          slide.addText(`Step ${step.step}`, {
            x: textBoxX + 0.05,
            y: textBoxY - 0.45,
            w: 1.4,
            h: 0.5,
            fontSize: 20,
            color: 'FF0000',
            bold: true,
            align: 'center',
            valign: 'middle'
          });
        } else {
          // Fallback: Add step number in top-left corner if no click data
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.2,
            y: 0.2,
            w: 1.5,
            h: 0.6,
            fill: { color: 'FFFFFF' },
            line: { color: 'FF0000', width: 2 },
            shadow: {
              type: 'outer',
              color: '000000',
              opacity: 0.3,
              offset: 2,
              blur: 4
            }
          });
          
          slide.addText(`Step ${step.step}`, {
            x: 0.25,
            y: 0.25,
            w: 1.4,
            h: 0.5,
            fontSize: 20,
            color: 'FF0000',
            bold: true,
            align: 'center',
            valign: 'middle'
          });
        }
        
        // Add click information if available
        if (step.clickData && step.clickData.text) {
          slide.addText(`Clicked: ${step.clickData.text.substring(0, 50)}${step.clickData.text.length > 50 ? '...' : ''}`, {
            x: 0.2,
            y: 5.2,
            w: 9.6,
            h: 0.3,
            fontSize: 10,
            color: '666666',
            align: 'left'
          });
        }
      }
      
      console.log('Writing PowerPoint file...');
      // Generate the file as a blob and trigger download
      const pptxOutput = await pptx.write({ outputType: 'blob' });
      console.log('PowerPoint blob created, size:', pptxOutput.size);
      
      // Create download link
      const url = URL.createObjectURL(pptxOutput);
      const link = document.createElement('a');
      link.href = url;
      link.download = `UserGuide_${new Date().toISOString().split('T')[0]}.pptx`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up with delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('Download triggered successfully');
    } catch (error) {
      console.error('PowerPoint generation failed:', error);
      alert('Failed to generate PowerPoint. Error: ' + error.message);
    }
  };

  return (
    <div className="capture-controls flex items-center gap-2">
      <button
        className={captureButtonClass}
        onClick={isCapturing ? handleStopCapture : handleStartCapture}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          {isCapturing ? (
            // Download icon
            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          ) : (
            // Camera icon
            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
          )}
          {isCapturing ? (
            <path d="M8 11a.5.5 0 0 1-.5-.5V6.707l-1.146 1.147a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-.5.5z"/>
          ) : (
            <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          )}
        </svg>
        <span>{isCapturing ? `Download (${steps.length})` : 'Screen Capture'}</span>
      </button>
      
      {steps.length > 0 && !isCapturing && (
        <button
          className={clearButtonClass}
          onClick={handleClearState}
          title="Clear all captured screenshots"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
          <span>Clear ({steps.length})</span>
        </button>
      )}
    </div>
  );
};

export default ScreenCapture;

// 'use client';

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import html2canvas from 'html2canvas';
// import classNames from 'classnames';

// const ScreenCapture = () => {
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [steps, setSteps] = useState([]);
//   const stepCounter = useRef(1);
//   const clickDataRef = useRef(null);

//   // A ref to hold the latest state for the beforeunload event.
//   const latestStateRef = useRef({ steps: [], isCapturing: false, stepCounter: 1 });
//   useEffect(() => {
//     latestStateRef.current = { steps, isCapturing, stepCounter: stepCounter.current };
//   }, [steps, isCapturing]);

//   // Button classes for styling.
//   const buttonClass = classNames({
//     "inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors": true,
//   });

//   const captureButtonClass = classNames(buttonClass, {
//     "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-500 hover:bg-red-100": isCapturing,
//     "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700": !isCapturing,
//   });

//   const clearButtonClass = classNames(buttonClass, {
//     "bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500 hover:bg-orange-100": true,
//   });

//   // Load persisted state only once on mount.
//   useEffect(() => {
//     const persistedSteps = JSON.parse(localStorage.getItem('screenCaptureSteps') || '[]');
//     if (persistedSteps.length > 0) {
//       setSteps(persistedSteps);
//       // Set step counter based on the persisted steps.
//       stepCounter.current = parseInt(localStorage.getItem('screenCaptureStepCounter'), 10)
//         || (persistedSteps[persistedSteps.length - 1].step + 1);
//     }
//     const active = localStorage.getItem('screenCaptureActive') === 'true';
//     setIsCapturing(active);

//     // Listen for storage changes (e.g., if multiple tabs are open)
//     const onStorageChange = (e) => {
//       if (e.key === 'screenCaptureSteps') {
//         const newSteps = JSON.parse(e.newValue || '[]');
//         setSteps(newSteps);
//       }
//       if (e.key === 'screenCaptureActive') {
//         const isActive = e.newValue === 'true';
//         setIsCapturing(isActive);
//       }
//       if (e.key === 'screenCaptureStepCounter') {
//         stepCounter.current = parseInt(e.newValue, 10) || stepCounter.current;
//       }
//     };
//     window.addEventListener('storage', onStorageChange);

//     // Attach beforeunload once to persist the current state.
//     const handleBeforeUnload = () => {
//       localStorage.setItem('screenCaptureSteps', JSON.stringify(latestStateRef.current.steps));
//       localStorage.setItem('screenCaptureStepCounter', latestStateRef.current.stepCounter.toString());
//       localStorage.setItem('screenCaptureActive', latestStateRef.current.isCapturing.toString());
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);

//     return () => {
//       window.removeEventListener('storage', onStorageChange);
//       window.removeEventListener('beforeunload', handleBeforeUnload);
//     };
//   }, []);

//   // Track mouse position during capture
//   useEffect(() => {
//     if (isCapturing) {
//       document.addEventListener('click', handleScreenClick, true);
//       document.body.style.cursor = 'crosshair';
//     } else {
//       document.removeEventListener('click', handleScreenClick, true);
//       document.body.style.cursor = 'auto';
//     }

//     return () => {
//       document.removeEventListener('click', handleScreenClick, true);
//       document.body.style.cursor = 'auto';
//     };
//   }, [isCapturing]);

//   // Clear all saved state
//   const handleClearState = useCallback(() => {
//     setSteps([]);
//     stepCounter.current = 1;
//     setIsCapturing(false);
//     localStorage.removeItem('screenCaptureSteps');
//     localStorage.removeItem('screenCaptureStepCounter');
//     localStorage.setItem('screenCaptureActive', 'false');
//   }, []);

//   // Start capturing without clearing previous steps.
//   const handleStartCapture = useCallback(() => {
//     setIsCapturing(true);
//     localStorage.setItem('screenCaptureActive', 'true');
//     // Use the stored counter if available; otherwise, default to 1.
//     const storedCounter = parseInt(localStorage.getItem('screenCaptureStepCounter'), 10);
//     if (storedCounter) {
//       stepCounter.current = storedCounter;
//     } else if (steps.length > 0) {
//       stepCounter.current = steps[steps.length - 1].step + 1;
//     } else {
//       stepCounter.current = 1;
//     }
//   }, [steps]);

//   // Stop capturing: generate the PPT, then clear state.
//   const handleStopCapture = useCallback(async () => {
//     console.log('Stopping capture, steps:', steps.length);
//     setIsCapturing(false);
//     localStorage.setItem('screenCaptureActive', 'false');
    
//     // Use the latest steps from localStorage to ensure we have all captures
//     const allSteps = JSON.parse(localStorage.getItem('screenCaptureSteps') || '[]');
//     console.log('All steps from storage:', allSteps.length);
    
//     if (allSteps.length > 0) {
//       await generatePowerPoint(allSteps);
//       // Clear state after download.
//       handleClearState();
//     } else {
//       alert('No screenshots captured yet. Please capture at least one screenshot before downloading.');
//     }
//   }, [handleClearState]);

//   const handleScreenClick = async (e) => {
//     // Avoid capturing clicks on the capture/clear buttons
//     if (e.target.closest('.capture-controls')) return;

//     // Prevent the default action
//     e.preventDefault();
//     e.stopPropagation();

//     try {
//       // Store click data before screenshot
//       clickDataRef.current = {
//         clientX: e.clientX,
//         clientY: e.clientY,
//         pageX: e.pageX,
//         pageY: e.pageY,
//         element: e.target,
//         elementRect: e.target.getBoundingClientRect()
//       };

//       // Take screenshot after a brief delay
//       await captureAndAnnotate();
//     } catch (error) {
//       console.error('Screenshot failed:', error);
//       alert('Failed to capture screenshot. Please try again.');
//     }
//   };

//   const captureAndAnnotate = async () => {
//     const clickData = clickDataRef.current;
//     if (!clickData) return;

//     // Options for html2canvas
//     const html2canvasOptions = {
//       useCORS: true,
//       logging: false,
//       scale: window.devicePixelRatio || 1,
//       width: window.innerWidth,
//       height: window.innerHeight,
//       windowWidth: window.innerWidth,
//       windowHeight: window.innerHeight,
//       x: window.scrollX || 0,
//       y: window.scrollY || 0,
//       scrollX: 0,
//       scrollY: 0
//     };

//     try {
//       // Use html2canvas to capture the screenshot
//       const canvas = await html2canvas(document.body, html2canvasOptions);
//       const ctx = canvas.getContext('2d');

//       // Calculate accurate click position on the canvas
//       const rect = canvas.getBoundingClientRect();
//       const scaleX = canvas.width / window.innerWidth;
//       const scaleY = canvas.height / window.innerHeight;

//       // Get the exact click coordinates
//       const canvasX = clickData.clientX * scaleX;
//       const canvasY = clickData.clientY * scaleY;

//       // Draw annotation
//       drawArrowAnnotation(ctx, canvasX, canvasY, scaleX, scaleY);

//       // Convert to data URL
//       const annotatedURL = canvas.toDataURL('image/png');
      
//       // Save the step
//       const newStep = {
//         step: stepCounter.current,
//         image: annotatedURL,
//         width: canvas.width,
//         height: canvas.height,
//         clickData: {
//           x: clickData.clientX,
//           y: clickData.clientY,
//           element: clickData.element.tagName,
//           text: clickData.element.innerText || clickData.element.value || ''
//         }
//       };

//       setSteps(prevSteps => {
//         const updated = [...prevSteps, newStep];
//         localStorage.setItem('screenCaptureSteps', JSON.stringify(updated));
//         return updated;
//       });

//       stepCounter.current += 1;
//       localStorage.setItem('screenCaptureStepCounter', stepCounter.current.toString());

//     } catch (error) {
//       console.error('Error in capture process:', error);
//       throw error;
//     }
//   };

//   const drawArrowAnnotation = (ctx, clickX, clickY, scaleX, scaleY) => {
//     // Calculate arrow dimensions based on scale
//     const arrowLength = 70 * Math.min(scaleX, scaleY);
//     const arrowAngle = -45 * (Math.PI / 180); // -45 degrees
    
//     // Calculate arrow start position (tail of arrow)
//     const arrowStartX = clickX + Math.cos(arrowAngle) * arrowLength;
//     const arrowStartY = clickY + Math.sin(arrowAngle) * arrowLength;
    
//     // Draw arrow shadow for better visibility
//     ctx.save();
//     ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
//     ctx.shadowBlur = 4;
//     ctx.shadowOffsetX = 2;
//     ctx.shadowOffsetY = 2;
    
//     // Draw the arrow
//     drawArrow(ctx, arrowStartX, arrowStartY, clickX, clickY, scaleX, scaleY);
//     ctx.restore();

//     // Draw step number with background
//     const fontSize = Math.max(20 * Math.min(scaleX, scaleY), 16);
//     const stepText = `Step ${stepCounter.current}`;
    
//     ctx.font = `bold ${fontSize}px Arial`;
//     const textMetrics = ctx.measureText(stepText);
//     const textWidth = textMetrics.width;
//     const textHeight = fontSize;
    
//     // Position text at arrow start with padding
//     const textX = arrowStartX + 10;
//     const textY = arrowStartY - 10;
//     const padding = 5;
    
//     // Draw text background
//     ctx.fillStyle = 'white';
//     ctx.fillRect(
//       textX - padding,
//       textY - textHeight - padding,
//       textWidth + padding * 2,
//       textHeight + padding * 2
//     );
    
//     // Draw text border
//     ctx.strokeStyle = '#FF0000';
//     ctx.lineWidth = 2;
//     ctx.strokeRect(
//       textX - padding,
//       textY - textHeight - padding,
//       textWidth + padding * 2,
//       textHeight + padding * 2
//     );
    
//     // Draw text
//     ctx.fillStyle = '#FF0000';
//     ctx.fillText(stepText, textX, textY);
//   };

//   const drawArrow = (ctx, fromX, fromY, toX, toY, scaleX, scaleY) => {
//     const headLength = 20 * Math.min(scaleX, scaleY);
//     const angle = Math.atan2(toY - fromY, toX - fromX);

//     // Set arrow style
//     ctx.strokeStyle = '#FF0000';
//     ctx.fillStyle = '#FF0000';
//     ctx.lineWidth = 3 * Math.min(scaleX, scaleY);
//     ctx.lineCap = 'round';
//     ctx.lineJoin = 'round';
    
//     // Draw arrow shaft
//     ctx.beginPath();
//     ctx.moveTo(fromX, fromY);
//     ctx.lineTo(toX, toY);
//     ctx.stroke();

//     // Draw arrow head (filled triangle)
//     ctx.beginPath();
//     ctx.moveTo(toX, toY);
//     ctx.lineTo(
//       toX - headLength * Math.cos(angle - Math.PI / 6),
//       toY - headLength * Math.sin(angle - Math.PI / 6)
//     );
//     ctx.lineTo(
//       toX - headLength * Math.cos(angle + Math.PI / 6),
//       toY - headLength * Math.sin(angle + Math.PI / 6)
//     );
//     ctx.closePath();
//     ctx.fill();
    
//     // Add a small circle at the exact click point for precision
//     ctx.beginPath();
//     ctx.arc(toX, toY, 5 * Math.min(scaleX, scaleY), 0, 2 * Math.PI);
//     ctx.fillStyle = '#FF0000';
//     ctx.fill();
//     ctx.strokeStyle = 'white';
//     ctx.lineWidth = 2;
//     ctx.stroke();
//   };

//   const generatePowerPoint = async (stepsToExport) => {
//     try {
//       console.log('Generating PowerPoint with steps:', stepsToExport.length);
      
//       // Dynamically import PptxGenJS only when needed and only on the client
//       const PptxGenJS = (await import('pptxgenjs')).default;
//       const pptx = new PptxGenJS();
      
//       // Set default slide size (16:9 ratio)
//       pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
//       pptx.layout = 'LAYOUT_16x9';
      
//       // Add title slide
//       const titleSlide = pptx.addSlide();
//       titleSlide.background = { color: 'FFFFFF' };
//       titleSlide.addText('User Guide', {
//         x: 1,
//         y: 2,
//         w: 8,
//         h: 1,
//         fontSize: 36,
//         color: '363636',
//         bold: true,
//         align: 'center'
//       });
//       titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
//         x: 1,
//         y: 3,
//         w: 8,
//         h: 0.5,
//         fontSize: 14,
//         color: '666666',
//         align: 'center'
//       });
//       titleSlide.addText(`Total Steps: ${stepsToExport.length}`, {
//         x: 1,
//         y: 3.5,
//         w: 8,
//         h: 0.5,
//         fontSize: 14,
//         color: '666666',
//         align: 'center'
//       });
      
//       // Add each screenshot as a slide
//       for (const step of stepsToExport) {
//         const slide = pptx.addSlide();
//         slide.background = { color: 'F5F5F5' };
        
//         // Calculate aspect ratio and fit image to slide
//         const imgAspectRatio = (step.width || 16) / (step.height || 9);
//         const slideAspectRatio = 10 / 5.625;
        
//         let imgWidth, imgHeight, imgX, imgY;
        
//         if (imgAspectRatio > slideAspectRatio) {
//           // Image is wider than slide
//           imgWidth = 9.5;
//           imgHeight = 9.5 / imgAspectRatio;
//           imgX = 0.25;
//           imgY = (5.625 - imgHeight) / 2;
//         } else {
//           // Image is taller than slide
//           imgHeight = 5.125;
//           imgWidth = 5.125 * imgAspectRatio;
//           imgX = (10 - imgWidth) / 2;
//           imgY = 0.25;
//         }
        
//         // Add the image with proper sizing
//         slide.addImage({
//           data: step.image,
//           x: imgX,
//           y: imgY,
//           w: imgWidth,
//           h: imgHeight
//         });
        
//         // Add step number in top-left corner with background
//         slide.addShape(pptx.ShapeType.rect, {
//           x: 0.2,
//           y: 0.2,
//           w: 1.5,
//           h: 0.6,
//           fill: { color: 'FFFFFF' },
//           line: { color: 'FF0000', width: 2 },
//           shadow: {
//             type: 'outer',
//             color: '000000',
//             opacity: 0.3,
//             offset: 2,
//             blur: 4
//           }
//         });
        
//         slide.addText(`Step ${step.step}`, {
//           x: 0.25,
//           y: 0.25,
//           w: 1.4,
//           h: 0.5,
//           fontSize: 20,
//           color: 'FF0000',
//           bold: true,
//           align: 'center',
//           valign: 'middle'
//         });
        
//         // Add click information if available
//         if (step.clickData && step.clickData.text) {
//           slide.addText(`Clicked: ${step.clickData.text.substring(0, 50)}${step.clickData.text.length > 50 ? '...' : ''}`, {
//             x: 0.2,
//             y: 5.2,
//             w: 9.6,
//             h: 0.3,
//             fontSize: 10,
//             color: '666666',
//             align: 'left'
//           });
//         }
//       }
      
//       console.log('Writing PowerPoint file...');
//       // Generate the file as a blob and trigger download
//       const pptxOutput = await pptx.write({ outputType: 'blob' });
//       console.log('PowerPoint blob created, size:', pptxOutput.size);
      
//       // Create download link
//       const url = URL.createObjectURL(pptxOutput);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `UserGuide_${new Date().toISOString().split('T')[0]}.pptx`;
//       link.style.display = 'none';
//       document.body.appendChild(link);
//       link.click();
      
//       // Clean up with delay
//       setTimeout(() => {
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//       }, 1000);
      
//       console.log('Download triggered successfully');
//     } catch (error) {
//       console.error('PowerPoint generation failed:', error);
//       alert('Failed to generate PowerPoint. Error: ' + error.message);
//     }
//   };

//   return (
//     <div className="capture-controls flex items-center gap-2">
//       <button
//         className={captureButtonClass}
//         onClick={isCapturing ? handleStopCapture : handleStartCapture}
//       >
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           width="16"
//           height="16"
//           fill="currentColor"
//           viewBox="0 0 16 16"
//         >
//           {isCapturing ? (
//             // Download icon
//             <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
//           ) : (
//             // Camera icon
//             <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
//           )}
//           {isCapturing ? (
//             <path d="M8 11a.5.5 0 0 1-.5-.5V6.707l-1.146 1.147a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-.5.5z"/>
//           ) : (
//             <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
//           )}
//         </svg>
//         <span>{isCapturing ? `Download (${steps.length})` : 'Screen Capture'}</span>
//       </button>
      
//       {steps.length > 0 && !isCapturing && (
//         <button
//           className={clearButtonClass}
//           onClick={handleClearState}
//           title="Clear all captured screenshots"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="16"
//             height="16"
//             fill="currentColor"
//             viewBox="0 0 16 16"
//           >
//             <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
//             <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
//           </svg>
//           <span>Clear ({steps.length})</span>
//         </button>
//       )}
//     </div>
//   );
// };

// export default ScreenCapture;

