import { useState, useRef, useCallback } from "react";
import useUser from "utils/useUser";
import withSession from "utils/withSession";
import {
  createEntry,
  updateEntry,
  upload,
  publishEntry,
  getHTML,
} from "handlers/bll";
import {
  request,
  GET_ALL_COURSES,
  GET_ALL_STUDENTS,
} from "utils/graphqlRequest";
import { POST_REVIEW_STATUS, isUserTeacherOfCourse } from "utils";

import Main from "components/Main/Main";
import PostForm from "components/Posts/PostForm";
import PostView from "components/Posts/PostView";
import TopBar from "components/TopBar/TopBar";
import Loader from "components/Loader/Loader";

const formBaseState = {
  title: "",
  description: "",
  coverimage: "",
  course: null,
  attachments: null,
  monograph: null,
  error: false,
  tags: "",
  coauthors: null,
  agreedterms: false,
  review: POST_REVIEW_STATUS.PENDING,
};

const NewPost = (props) => {
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const { user } = useUser({ redirectTo: "/" });
  const [showPreview, setShowPreview] = useState(false);
  const [editView, setEditView] = useState(false);
  const [suggestionView, setSuggestionView] = useState(false);
  const [formState, setFormState] = useState(formBaseState);
  const [previewIframe, setPreviewIframe] = useState(null);
  const clearSubmitForm = () => {
    setFormState(formBaseState);
  };
  const refs = {
    attachments: useRef(),
    coverimage: useRef(),
    monograph: useRef(),
    agreedterms: useRef(),
  };

  const [statusBarState, setStatusBarState] = useState({
    error: null,
    success:
      "Los campos con (*) son requeridos. Debes guardar tu publicación para enviar a aprobación.",
  });

  const triggerLoading = (show) => {
    if (show) {
      document
        .getElementsByTagName("body")[0]
        .classList.add("htmlBackgroundBackdrop");
      setShowLoadingScreen(true);
    } else {
      document
        .getElementsByTagName("body")[0]
        .classList.remove("htmlBackgroundBackdrop");
      setShowLoadingScreen(false);
    }
  };

  const doSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      triggerLoading(true);
      const { id, error, monographView, ...postData } = formState;

      if (isUserTeacherOfCourse(user, props.courses)) {
        postData.review = POST_REVIEW_STATUS.APPROVED;
      }

      let entry;
      if (postData.id) {
        entry = await updateEntry(postData);
      } else {
        entry = await createEntry({
          author: user.id,
          ...postData,
        });
      }

      if (entry?.error) {
        console.error("No se pudo actualizar la entrada", entry?.error);
        setStatusBarState({
          success: null,
          error: "No se pudo guardar la entrada",
        });
      } else {
        setFormState({ ...entry, ...postData });
        setStatusBarState({
          error: null,
          success:
            'Publicación guardada. Debes "Solicitar aprobación" para ser enviada a aprobación',
        });
      }

      triggerLoading(false);
    },
    [formState]
  );

  const onChange = useCallback(
    async (e, name) => {
      let itemValue;
      if (refs[name]) {
        const _files = refs[name]?.current?.files;
        if (_files) {
          triggerLoading(true);
          const files = await upload(_files, true);
          console.log("this is first files=====>", _files);
          if (e.target.name === "monograph") {
            const loadedMonograph = await getHTML(
              `/api/${files.url.replace("https://www.datocms-assets.com/", "")}`
            );
            setPreviewIframe(loadedMonograph);
          }

          itemValue = files;
          triggerLoading(false);
        } else {
          itemValue = refs[name].current.checked;
        }
      } else {
        itemValue = e.target.value;
      }
      delete formState[name];
      setFormState({ [name]: itemValue, ...formState });
    },
    [formState]
  );

  const requestApproval = useCallback(async () => {
    triggerLoading(true);
    await publishEntry(formState.id);
    setStatusBarState({
      error: null,
      success:
        "Tu publicación ha sido enviada a aprobación, ve a tu perfil para verla",
    });
    triggerLoading(false);
  }, [formState]);

  const hidePreview = (e) => {
    e.preventDefault();
    setShowPreview(false);
    setEditView(false);
  };

  const editViewSet = (e) => {
    e.preventDefault();
    setEditView(!editView);
    if(editView == true){
      setSuggestionView(false)
    }
  };

  const suggestionViewSet = (e) => {
    e.preventDefault();
    setSuggestionView(!suggestionView);
    console.log("this is suggestion view status=======>", suggestionView);
  };

  const doShowPreview = useCallback(
    async (e) => {
      e.preventDefault();
      if (!previewIframe && formState?.monograph) {
        const loadedMonograph = await getHTML(
          `/api/${formState?.monograph.url.replace(
            "https://www.datocms-assets.com/",
            ""
          )}`
        );
        setPreviewIframe(loadedMonograph);
      }
      setShowPreview(true);
    },
    [formState]
  );

  const setAgreedterms = useCallback(
    async (e) => {
      e.preventDefault();
      const { agreedterms, ...restFormState } = formState;
      restFormState.agreedterms = !agreedterms;
      setFormState(restFormState);
    },
    [formState]
  );

  const setCoAuthors = useCallback(
    async (e, selectedCoAuthor) => {
      e.preventDefault();
      const { coauthors, ...restFormState } = formState;
      let selectedCoauthors = coauthors || [];
      selectedCoauthors.push(selectedCoAuthor);
      restFormState.coauthors = selectedCoauthors;
      setFormState(restFormState);
    },
    [formState]
  );

  const removeCoAuthor = useCallback(
    async (e, coAuthorId) => {
      e.preventDefault();
      const { coauthors, ...restFormState } = formState;
      const removeCoAuthorIndex = coauthors.findIndex(
        (coAuthor) => coAuthor.id === coAuthorId
      );
      coauthors.splice(removeCoAuthorIndex, 1);
      restFormState.coauthors = coauthors;
      setFormState(restFormState);
    },
    [formState]
  );

  const formHasChanged = formState !== formBaseState;

  const saveDocument = async () => {
    console.log("hello");
    const iframe = document.getElementById("documentWindow");
    const iframeContent =
      iframe.contentWindow.document.head.innerHTML +
      iframe.contentWindow.document.body.innerHTML;
    const htmlFile = new File([iframeContent], "monograph.html", {
      type: "text/html",
    });
    triggerLoading(true);
    const files = await upload([htmlFile], true);
    const loadedMonograph = await getHTML(
      `/api/${files.url.replace("https://www.datocms-assets.com/", "")}`
    );
    setPreviewIframe(loadedMonograph);
    triggerLoading(false);
    delete formState["monograph"];
    setFormState({ ["monograph"]: files, ...formState });
  };

  return (
    <Main>
      {showPreview && (
        <TopBar>
          <a
            className="text-other text-2xl cursor-pointer hover:text-primary hover:underline hover:underline-offset-1"
            onClick={hidePreview}
            children="<div Volver a archivo"
          />
          <div>
            {editView && (
              <a
                className="text-other mr-8 text-2xl cursor-pointer hover:text-primary hover:underline hover:underline-offset-1"
                onClick={suggestionViewSet}
                children={`${suggestionView ? "Hide Suggestion" : "Show Suggestion"}`}
              />
            )}
            <a
              className="text-other text-2xl cursor-pointer hover:text-primary hover:underline hover:underline-offset-1"
              onClick={editViewSet}
              children={!editView ? "Edit Document" : "Close Editor"}
            />
            <a
              className="text-other ml-8 text-2xl cursor-pointer hover:text-primary hover:underline hover:underline-offset-1"
              onClick={saveDocument}
              children="Save Document"
            />
          </div>
        </TopBar>
      )}
      {!showPreview && (
        <TopBar>
          {(statusBarState.error || statusBarState.success) && (
            <h5
              className={
                statusBarState.error
                  ? "text-error text-2xl"
                  : "text-primary text-2xl"
              }
            >
              {statusBarState.error || statusBarState.success}
            </h5>
          )}
        </TopBar>
      )}
      {showPreview ? (
        <PostView
          post={formState}
          user={user}
          previewIframe={previewIframe}
          editView={editView}
          suggestionView={suggestionView}
          {...props}
        />
      ) : (
        <PostForm
          refs={refs}
          form={formState}
          doSubmit={doSubmit}
          clearForm={clearSubmitForm}
          onChange={onChange}
          requestApproval={requestApproval}
          formHasChanged={formHasChanged}
          setShowPreview={doShowPreview}
          user={user}
          setAgreedterms={setAgreedterms}
          setCoAuthors={setCoAuthors}
          removeCoAuthor={removeCoAuthor}
          {...props}
        />
      )}
      <Loader show={showLoadingScreen} />
    </Main>
  );
};
export default NewPost;

export const getServerSideProps = withSession(async function ({ req }) {
  const currentUser = req.session.get("user");
  if (!currentUser) {
    return { props: {} };
  }
  const { allUsers, allCourses } = await request([
    GET_ALL_COURSES(currentUser.id),
    GET_ALL_STUDENTS,
  ]);
  return {
    props: { courses: allCourses, students: allUsers },
  };
});
