import React, { useState, useEffect, useRef } from 'react';
import Immutable from 'immutable';

function DrawArea(props) {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCrosshair, setIsCrosshair] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [zoom, setZoom] = useState(1);
  const drawAreaEl = useRef(null);

  useEffect(() => {
    document.getElementById("drawArea").addEventListener("mouseup", handleMouseUp);
    props.getBounds({
      x: drawAreaEl.current.getBoundingClientRect().left,
      y: drawAreaEl.current.getBoundingClientRect().bottom,
    });

    // Adding the wheel event listener for zooming
    document.getElementById("drawArea").addEventListener("wheel", handleWheel);

    return () => {
      document.getElementById("drawArea").removeEventListener("mouseup", handleMouseUp);
      document.getElementById("drawArea").removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    if (props.flag === "undo") {
      setLines((prevLines) => [...prevLines.slice(0, -1)]);
      props.changeFlag();
    }
    if (props.flag === "redo") {
      // Implement redo logic if needed
      props.changeFlag();
    }
  }, [props.flag]);

  useEffect(() => {
    if (props.buttonType === "draw") {
      addMouseDown();
      props.resetButtonType();
    }
  }, [props.buttonType]);

  useEffect(() => {
    if (!isDrawing && lines.length) {
      props.getPaths(lines[lines.length - 1]);
    }
  }, [lines, props]);

  const handleMouseUp = (e) => {
    setIsCrosshair(false);
    setIsDrawing(false);
    const stopCoordinates = relativeCoordinatesForEvent(e);
    setEnd(stopCoordinates ? `X: ${stopCoordinates.get('x')}, Y: ${stopCoordinates.get('y')}` : null);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) {
      return;
    }

    const startCoordinates = relativeCoordinatesForEvent(e);
    setStart(startCoordinates ? `X: ${startCoordinates.get('x')}, Y: ${startCoordinates.get('y')}` : null);
    let obj = {
      start: startCoordinates,
      end: startCoordinates,
      page: props.page,
      type: "line",
    };
    setLines((prevLines) => [...prevLines, obj]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) {
      return;
    }

    const endCoordinates = relativeCoordinatesForEvent(e);
    setLines((prevLines) =>
      prevLines.map((line, index) =>
        index === prevLines.length - 1 ? { ...line, end: endCoordinates } : line
      )
    );
  };

  const relativeCoordinatesForEvent = (e) => {
    const boundingRect = drawAreaEl.current.getBoundingClientRect();
    return new Immutable.Map({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
  };

  const addMouseDown = () => {
    setIsCrosshair(true);
    document.getElementById("drawArea").addEventListener("mousedown", handleMouseDown, { once: true });
  };

  // Handle wheel event for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1; // Adjust the scale factor as needed
    setZoom((prevZoom) => prevZoom * scaleFactor);
  };

  return (
    <>
      <div>
        <p>Start Coordinates: {start}</p>
        <p>End Coordinates: {end}</p>
      </div>
      <div
        id="drawArea"
        ref={drawAreaEl}
        style={{
          marginTop: "25px",
          cursor: isCrosshair ? "crosshair" : props.cursor,
          transform: `scale(${zoom})`, 
        }}
        onMouseMove={handleMouseMove}
      >
        {props.children}
        <Drawing lines={lines} page={props.page} />
      </div>
    </>
  );
}

function Drawing({ lines, page }) {
  return (
    <svg className="drawing" style={{ position: 'absolute', zIndex: 10, top: 0, left: 0, pointerEvents: 'none' }}>
      {lines.map((line, index) => (
        <DrawingLine key={index} line={line} page={page} />
      ))}
    </svg>
  );
}

function DrawingLine({ line, page }) {
  if (line.page === page && line.type === "line") {
    return (
      <line
        className="line"
        x1={line.start.get("x")}
        y1={line.start.get("y")}
        x2={line.end.get("x")}
        y2={line.end.get("y")}
        stroke="red"
        strokeWidth="2"
      />
    );
  }
  return null;
}

export default DrawArea;
