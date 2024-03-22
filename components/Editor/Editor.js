import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";

// import "froala-editor/js/plugins/colors.min.js";
// import "froala-editor/js/plugins/file.min.js";
// import "froala-editor/js/plugins/font_size.min.js";
// import "froala-editor/js/plugins/forms.min.js";

const FroalaEditorComponent = dynamic(
  async () => {
    await Promise.all([
      import("froala-editor/js/plugins.pkgd.min.js"),
      // import("@wiris/mathtype-froala3/wiris.js"),
    ]);

    const editorModule = await import("react-froala-wysiwyg");

    return editorModule;
  },
  {
    ssr: false,
    // loading: () => <p>Loading...</p>,
  }
);

const Editor = ({ editorContent, setChangedContent, section, setSection, ...props }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const [model, setModel] = useState("");

  useEffect(() => {
    setModel(editorContent.innerHTML);
    try {
      setSection(editorContent.getElementsByTagName("h1")[0].textContent);
    } catch (e) {
      console.log("Please select correct section");
    }
  }, [editorContent]);

  const handleModelChange = (event) => {
    setChangedContent(event);
    setModel(event);
  };

  const config = {
    attribution: false,
    fontSizeDefaultSelection: "12",
    fontFamilySelection: true,
    placeholderText: "Edite aquí su contenido!",
    // toolbarButtons: ["wirisEditor", "wirisChemistry"],
    // imageEditButtons: ["wirisEditor", "wirisChemistry"],
    imageUploadMethod: "POST",
    // Set the image upload URL.
    // Validation
    imageAllowedTypes: ["jpeg", "jpg", "png"],
    // Set max image size to 10MB.
    imageMaxSize: 1024 * 1024 * 10,
    events: {
      "froalaEditor.image.beforeUpload": function () {
        console.log("digh");
      },
    },
  };

  return (
    <div className="w-full h-full p-1">
      <div className="flex justify-between">
        <span className="font-semibold text-[30px]">{section}</span>
      </div>
      <form className="w-full h-full mt-5">
        {isBrowser && (
          <>
            <FroalaEditorComponent
              tag="textarea"
              config={config}
              model={model}
              onModelChange={handleModelChange}
            />
          </>
        )}
      </form>
    </div>
  );
};

export default Editor;
