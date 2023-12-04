import React, { useState, useEffect, useRef } from "react";

import SinglePage from "./Components/SinglePage";
import DrawArea from "./Components/DrawArea";
import AutoTextArea from "./Components/AutoTextArea";

export default function App() {
  const [result, setResult] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [redoStack, setRedoStack] = useState([]);
  const [flag, setFlag] = useState("");
  const [bounds, setBounds] = useState({});
  const [isText, setIsText] = useState(false);
  const [buttonType, setButtonType] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const tempRef = useRef(null);

  useEffect(() => {
    if (isText) {
      setIsText(false);
    }
  }, [result]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setPdfFile(file);
  };

  const pageChange = (num) => {
    setPageNumber(num);
  };

  const addText = () => {
    setIsText(true);
    document.getElementById("drawArea").addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        setResult((result) => [
          ...result,
          {
            id: generateKey(e.pageX),
            x: e.pageX,
            y: e.pageY - 10,
            text: "",
            page: pageNumber,
            type: "text",
            ref: tempRef,
          },
        ]);
      },
      { once: true }
    );
  };

  const undo = () => {
    let temp = result.pop();
    if (temp) {
      if (temp.type === "freehand") {
        setFlag("undo");
      }
      setRedoStack((stack) => [...stack, temp]);
      setResult(result);
    }
  };

  const changeFlag = () => {
    setFlag("");
  };

  const redo = () => {
    let top = redoStack.pop();
    if (top) {
      if (top.type === "freehand") {
        setFlag("redo");
      }
      setResult((res) => [...res, top]);
    }
  };

  const getPaths = (el) => {
    setResult((res) => [...res, el]);
  };

  const getBounds = (obj) => {
    setBounds(obj);
  };

  const generateKey = (pre) => {
    return `${pre}_${new Date().getTime()}`;
  };

  const onTextChange = (id, txt, ref) => {
    let indx = result.findIndex((x) => x.id === id);
    let item = { ...result[indx] };
    item.text = txt;
    item.ref = ref;
    result[indx] = item;
    setResult(result);
  };

  const changeButtonType = (type) => {
    setButtonType(type);
  };

  const resetButtonType = () => {
    setButtonType("");
  };

  return (
    <div className="App">
      <div style={{background:"#1a73e8",height:"60px"}}>
      <div style={{ display: "flex", alignItems: "center"}}>
        <input type="file" onChange={handleFileChange} style={{margin:"10px",marginTop:"5px"}} />
      </div>
      </div>
      {pdfFile && (
        <>
          {result.map((res) => {
            if (res.type === "text") {
              let isShowing = "hidden";
              if (res.page === pageNumber) {
                isShowing = "visible";
              }
              return (
                <AutoTextArea
                  key={res.id}
                  unique_key={res.id}
                  val={res.text}
                  onTextChange={onTextChange}
                  style={{
                    visibility: isShowing,
                    color: "red",
                    fontWeight: "normal",
                    fontSize: 16,
                    zIndex: 20,
                    position: "absolute",
                    left: res.x + "px",
                    top: res.y + "px",
                  }}
                ></AutoTextArea>
              );
            } else {
              return null;
            }
          })}

          <div>
            <button
              onClick={() => changeButtonType("draw")}
              style={{ marginTop: "1%", marginBottom: "1%" }}
            >
              Draw
            </button>
          </div>

          <SinglePage
            resetButtonType={resetButtonType}
            buttonType={buttonType}
            cursor={isText ? "text" : "default"}
            pdf={pdfFile}
            pageChange={pageChange}
            getPaths={getPaths}
            flag={flag}
            getBounds={getBounds}
            changeFlag={changeFlag}
          />
          <hr></hr>
        </>
      )}
    </div>
  );
}
