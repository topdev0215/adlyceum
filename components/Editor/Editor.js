import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";

const FroalaEditorComponent = dynamic(() => import("react-froala-wysiwyg"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Editor = ({editorContent, setChangedContent, ...props}) => {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const [model, setModel] = useState("");

  useEffect(() => {
    setModel(editorContent);
  }, [editorContent]);

  const handleModelChange = (event) => {
    setChangedContent(event);
    setModel(event);
  };

  return (
    <div className="w-full h-full p-1">
      <span className="font-semibold text-[30px]">Edit Content</span>
      <form className="w-full h-full mt-5">
        {isBrowser && (
          <>
            <FroalaEditorComponent
              tag="textarea"
              config={{
                placeholderText: "Edit Your Content Here!",
                codeMirror: true,
                codeMirrorOptions: {
                  indentWithTabs: true,
                  lineNumbers: true,
                },
                // Configure file upload
                fileUpload: true,
                fileUploadURL: "YOUR_FILE_UPLOAD_ENDPOINT",
                fileMaxSize: 1024 * 1024 * 5, // 5MB
                fileAllowedTypes: ["application/pdf", "image/*", "text/plain"],
              }}
              model={model}
              onModelChange={handleModelChange}
            />
          </>
        )}
      </form>
    </div>
  );
}

export default Editor;
