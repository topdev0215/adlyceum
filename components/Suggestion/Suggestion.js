import { useState, useEffect } from "react";
import BouncingDotsLoader from "./BouncingDotsLoader";
import axios from "axios";
const Suggestion = ({ changedContent, setEditorContent, section }) => {
  const [suggestion, setSuggestion] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [aiContentRate, setAiContentRate] = useState("0");
  const [loadingStatus, setLoadingStatus] = useState(false)
  const sectionCheck = async () => {
    axios
      .post("http://127.0.0.1:5000/sectionCheck", null, {
        params: {
          title: section,
          content: changedContent,
        },
      })
      .then(function (response) {
        setLoadingStatus(false)
        console.log("this is suggestion", response["data"].suggestion);
        setSuggestion(response["data"].suggestion);
        setImprovedText(response['data'].improvedText);
        setAiContentRate(response['data'].aiContentRate);
        console.log("aicontentratio===========>",response['data'].aiContentRate);
        
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const improveCheck = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(improvedText, "text/html");
    setEditorContent(doc.body);
  };

  const getSuggestion = () => {
    sectionCheck();
    setLoadingStatus(true)
  };

  return (
    <>
      <div className="bg-zinc-100 p-5">
        <div className="">
          <img
            src="https://cdn-icons-png.freepik.com/256/11421/11421779.png"
            className="w-16 h-14 cursor-pointer absolute border p-1 rounded-md bg-lime-100 border-green-400 hover:bg-green-200"
            onClick={getSuggestion}
          ></img>
          <div className="font-semibold text-[2rem] text-center pt-5">
            Writing Recommendation
          </div>
        </div>
        <div className="p-2">
          <div className="font-semibold text-[1.2rem]">Suggestions</div>
          <div className="flex justify-center py-2 relative">
            <div
              id="suggestions"
              className="bg-white w-[100%] h-[20vh] p-2 rounded-lg overflow-y-auto"
            >
              {loadingStatus ?
              <div className="pt-2">
                <BouncingDotsLoader />
              </div>
              : suggestion}
            </div>
          </div>
        </div>
        <div className="p-2">
          <h2 className="font-semibold text-[1.2rem]">Improved Content</h2>
          <div className="flex justify-center py-2 relative">
            <div
              id="improved-content"
              className="bg-white w-[100%] h-[20vh] p-2 rounded-lg overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: improvedText }}
            >
            </div>
            <img
              src="https://cdn-icons-png.freepik.com/256/3472/3472620.png"
              className="w-8 h-8 absolute right-1 bottom-3 cursor-pointer"
              onClick={improveCheck}
            ></img>
          </div>
        </div>
        <div className="p-2">
          <h2 className="font-semibold text-[1.2rem] text-red-600">
            * Publication Limits
          </h2>
          <ul className="list-disc pl-5">
            <li>Political incorrectness</li>
            <li>Lack of coherence</li>
            <li>Exceeding the acceptable level of AI-generated content</li>
            <li>Title length</li>
          </ul>
          <div className="pt-2">
            <p className="text-green-500">AI Content Ratio: {aiContentRate}%</p>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Suggestion;
