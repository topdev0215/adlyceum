import React, { useState, useEffect } from "react";

const IFrame = ({
  url,
  className = "",
  editView,
  setEditorContent,
  changedContent,
  ...props
}) => {
  const [editElement, setEditElement] = useState();

  const handleClick = function (event) {
    event.preventDefault();
    var clickedElement = event.target;
    var parentElement = clickedElement.parentNode;
    setEditorContent(parentElement.innerHTML);
    setEditElement(parentElement);
  };

  const handleMouseOver = function (event) {
    var hoveredElement = event.target;
    var parentElement = hoveredElement.parentNode;
    // hoveredElement.style.border = "1px solid #000";
    hoveredElement.style.cursor = "pointer";
    if (!parentElement.style) return;
    parentElement.style.border = "1px solid #000";
  };

  const handleMouseOut = function (event) {
    var leftElement = event.target;
    var parentElement = leftElement.parentNode;
    if (!parentElement.style) return;
    parentElement.style.border = "none";
    leftElement.style.cursor = "auto";
  };

  useEffect(() => {
    const iframe = document.getElementById("documentWindow");
    if (editView && iframe) {
      iframe?.contentWindow?.document?.addEventListener("click", handleClick);
      iframe?.contentWindow?.document?.addEventListener(
        "mouseover",
        handleMouseOver
      );
      iframe?.contentWindow?.document?.addEventListener(
        "mouseout",
        handleMouseOut
      );
    }
    // Cleanup function
    return () => {
      if (iframe) {
        iframe?.contentWindow?.document?.removeEventListener(
          "click",
          handleClick
        );
        iframe?.contentWindow?.document?.removeEventListener(
          "mouseover",
          handleMouseOver
        );
        iframe?.contentWindow?.document?.removeEventListener(
          "mouseout",
          handleMouseOut
        );
      }
    };
  }, [editView]);

  useEffect(() => {
    console.log("This is second changed content===========>", changedContent);
    if (!editElement) return;
    editElement.innerHTML = changedContent;
  }, [changedContent]);

  return (
    <iframe
      id="documentWindow"
      src={url}
      className={`border-none w-full h-full my-4 overflow-unset h-full overflow-none ${className}`}
      {...props}
    />
  );
};

export default IFrame;
