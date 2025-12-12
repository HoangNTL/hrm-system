import { useState, useEffect } from 'react';

function Icon({ name, className = 'w-5 h-5', color, ...props }) {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const iconPath = new URL(`../../assets/icons/${name}.svg`, import.meta.url).href;
        const response = await fetch(iconPath);
        const text = await response.text();
        setSvgContent(text);
      } catch {
        console.error(`Icon "${name}" not found`);
      }
    };

    loadSvg();
  }, [name]);

  if (!svgContent) {
    return null;
  }

  // Parse SVG and inject className and style
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  if (svgElement) {
    // Add classes
    if (className) {
      const existingClasses = svgElement.getAttribute('class') || '';
      svgElement.setAttribute('class', `${existingClasses} ${className}`.trim());
    }

    // Add inline style for color if provided
    if (color) {
      svgElement.setAttribute('style', `color: ${color}; stroke: ${color};`);
    }

    // Set proper display and alignment
    const currentStyle = svgElement.getAttribute('style') || '';
    svgElement.setAttribute(
      'style',
      `${currentStyle} display: inline-block; vertical-align: middle;`.trim(),
    );

    return (
      <span
        className="inline-flex items-center justify-center"
        style={{ verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: svgElement.outerHTML }}
        {...props}
      />
    );
  }

  return null;
}

export default Icon;
