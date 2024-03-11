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
      import("froala-editor/js/plugins/char_counter.min.js"),
      import("froala-editor/js/plugins/align.min.js"),
      import("froala-editor/js/plugins/font_size.min.js"),
      import("froala-editor/js/plugins/link.min.js"),
      import("froala-editor/js/plugins/file.min.js"),
      import("froala-editor/js/plugins/files_manager.min.js"),
      import("froala-editor/js/plugins/colors.min.js"),
      import("froala-editor/js/plugins/image.min.js"),
      import("froala-editor/js/plugins/image_manager.min.js"),
      import("froala-editor/js/plugins/table.min.js"),
      import("froala-editor/js/plugins/save.min.js"),
    ]);

    const editorModule = await import("react-froala-wysiwyg");

    return editorModule;
  },
  {
    ssr: false,
    loading: () => <p>Loading...</p>
  }
);

const Editor = ({ editorContent, setChangedContent, ...props }) => {
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

  const config = {
    pluginsEnabled: [
      "fontSize",
      "image",
      "imageManager",
      "table",
      "align",
      "colors",
      "emoticons",
      "paragraphFormat",
      "paragraphStyle",
      "quote",
      "url",
      "save"
    ],
    toolbarButtons: [
      "fontSize",
      "colors",
      "bold",
      "italic",
      "underline",
      "strikeThrough",
      "|",

      "textColor",
      "backgroundColor",
      "|",

      "alignLeft",
      "alignCenter",
      "alignRight",
      "|",

      "insertImage",
      "insertTable",
      "horizon",

      "|",
      "insertHR",
      "insertFile",
      "fileM",
    ],
    fontSize: [
      "8",
      "10",
      "12",
      "14",
      "18",
      "24",
      "30",
      "36",
      "48",
      "60",
      "72",
      "96",
    ],

    fontSizeDefaultSelection: "12",
    fontFamily: {
      "Arial,Helvetica,sans-serif": "Arial",
      "Georgia,serif": "Georgia",
      "Impact,Charcoal,sans-serif": "Impact",
      "Tahoma,Geneva,sans-serif": "Tahoma",
      "'Times New Roman',Times,serif": "Times New Roman",
      "Verdana,Geneva,sans-serif": "Verdana",
    },
    fontFamilySelection: true,

    imageEditButtons: [
      "imageReplace",
      "imageAlign",
      "imageRemove",
      "|",
      "imageLink",
      "linkOpen",
      "linkEdit",
      "linkRemove",
      "-",
      "imageDisplay",
      "imageStyle",
      "imageAlt",
      "imageSize",
    ],
    placeholderText: "Edit Your Content Here!",

    imageInsertButtons: ["imageBack", "|", "imageUpload", "imageByURL"],
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
      <span className="font-semibold text-[30px]">Edit Content</span>
      <form className="w-full h-full mt-5">
        {isBrowser && (
          <>
            <FroalaEditorComponent
              tag="textarea"
              config={{config}}
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
