import { Tab, Nav, Dropdown, Button, ButtonGroup, Toast } from "react-bootstrap";
import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  useRef,
  useLayoutEffect,
} from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, RouteComponentProps } from "react-router-dom";
import { Helmet } from "react-helmet";
import * as GQL from "src/core/generated-graphql";
import {
  mutateMetadataScan,
  useFindScene,
  useSceneIncrementO,
  useSceneDecrementO,
  useSceneResetO,
  useSceneGenerateScreenshot,
  useSceneUpdate,
  queryFindScenes,
  queryFindScenesByID,
} from "src/core/StashService";

import { SceneEditPanel } from "./SceneEditPanel";
import { ErrorMessage } from "src/components/Shared/ErrorMessage";
import { LoadingIndicator } from "src/components/Shared/LoadingIndicator";
import { Icon } from "src/components/Shared/Icon";
import { Counter } from "src/components/Shared/Counter";
import { useToast } from "src/hooks/Toast";
import SceneQueue, { QueuedScene } from "src/models/sceneQueue";
import { ListFilterModel } from "src/models/list-filter/filter";
import Mousetrap from "mousetrap";
import { OCounterButton } from "./OCounterButton";
import { OrganizedButton } from "./OrganizedButton";
import { ConfigurationContext } from "src/hooks/Config";
import { getPlayerPosition } from "src/components/ScenePlayer/util";
import {
  faEllipsisV,
  faChevronRight,
  faChevronLeft,
  faArrowsLeftRightToLine,
} from "@fortawesome/free-solid-svg-icons";
import { lazyComponent } from "src/utils/lazyComponent";

const SubmitStashBoxDraft = lazyComponent(
  () => import("src/components/Dialogs/SubmitDraft")
);
const ScenePlayer = lazyComponent(
  () => import("src/components/ScenePlayer/ScenePlayer")
);

const GalleryViewer = lazyComponent(
  () => import("src/components/Galleries/GalleryViewer")
);
const ExternalPlayerButton = lazyComponent(
  () => import("./ExternalPlayerButton")
);

const QueueViewer = lazyComponent(() => import("./QueueViewer"));
const SceneMarkersPanel = lazyComponent(() => import("./SceneMarkersPanel"));
const SceneFileInfoPanel = lazyComponent(() => import("./SceneFileInfoPanel"));
const SceneDetailPanel = lazyComponent(() => import("./SceneDetailPanel"));
const SceneHistoryPanel = lazyComponent(() => import("./SceneHistoryPanel"));
const SceneMoviePanel = lazyComponent(() => import("./SceneMoviePanel"));
const SceneGalleriesPanel = lazyComponent(
  () => import("./SceneGalleriesPanel")
);
const DeleteScenesDialog = lazyComponent(() => import("../DeleteScenesDialog"));
const GenerateDialog = lazyComponent(
  () => import("../../Dialogs/GenerateDialog")
);
const SceneVideoFilterPanel = lazyComponent(
  () => import("./SceneVideoFilterPanel")
);
import { objectPath, objectTitle } from "src/core/files";
import { RatingSystem } from "src/components/Shared/Rating/RatingSystem";
import { TagButtons } from "./TagsButtons";
import { PerformerButtons } from "./PerformerButtons";
import { SceneRecs } from "./SceneRecs";
import TextUtils from "src/utils/text";

interface UBarProps {
  scene: GQL.SceneDataFragment;
  setWideMode: () => void;
  setEditMode: () => void;
}
interface ISceneParams {
  id: string;
  
}
interface IProps {
  scene: GQL.SceneDataFragment;
  setTimestamp: (num: number) => void;
  queueScenes: QueuedScene[];
  onQueueNext: () => void;
  onQueuePrevious: () => void;
  onQueueRandom: () => void;
  onQueueSceneClicked: (sceneID: string) => void;
  onDelete: () => void;
  continuePlaylist: boolean;
  queueHasMoreScenes: boolean;
  onQueueMoreScenes: () => void;
  onQueueLessScenes: () => void;
  queueStart: number;
  collapsed: boolean;
  setCollapsed: (state: boolean) => void;
  setContinuePlaylist: (value: boolean) => void;
}
const UtilityBar: React.FC<UBarProps> = ({
  scene,
  setWideMode,
  setEditMode
}) => {
  const Toast = useToast();
  const intl = useIntl();
  const [updateScene] = useSceneUpdate();
  const [generateScreenshot] = useSceneGenerateScreenshot();
  const { configuration } = useContext(ConfigurationContext);

  const [showDraftModal, setShowDraftModal] = useState(false);
  const boxes = configuration?.general?.stashBoxes ?? [];

  const [incrementO] = useSceneIncrementO(scene.id);
  const [decrementO] = useSceneDecrementO(scene.id);
  const [resetO] = useSceneResetO(scene.id);

  const [organizedLoading, setOrganizedLoading] = useState(false);

  const [activeTabKey, setActiveTabKey] = useState("scene-details-panel");

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  async function onRescan() {
    await mutateMetadataScan({
      paths: [objectPath(scene)],
    });

    Toast.success(
      intl.formatMessage(
        { id: "toast.rescanning_entity" },
        {
          count: 1,
          singularEntity: intl
            .formatMessage({ id: "scene" })
            .toLocaleLowerCase(),
        }
      )
    );
  }
  async function onGenerateScreenshot(at?: number) {
    await generateScreenshot({
      variables: {
        id: scene.id,
        at,
      },
    });
    Toast.success(intl.formatMessage({ id: "toast.generating_screenshot" }));
  }
  const renderOperations = () => (
    <Dropdown className="h-fc">
      <Dropdown.Toggle
        variant="secondary"
        id="operation-menu"
        className="minimal h-fc"
        title={intl.formatMessage({ id: "operations" })}
      >
        <Icon icon={faEllipsisV} />
      </Dropdown.Toggle>
      <Dropdown.Menu className="bg-secondary text-white">
        {!!scene.files.length && (
          <Dropdown.Item
            key="rescan"
            className="bg-secondary text-white"
            onClick={() => onRescan()}
          >
            <FormattedMessage id="actions.rescan" />
          </Dropdown.Item>
        )}
        <Dropdown.Item
          key="generate"
          className="bg-secondary text-white"
          onClick={() => setIsGenerateDialogOpen(true)}
        >
          <FormattedMessage id="actions.generate" />
        </Dropdown.Item>
        <Dropdown.Item
          key="generate-screenshot"
          className="bg-secondary text-white"
          onClick={() => onGenerateScreenshot(getPlayerPosition())}
        >
          <FormattedMessage id="actions.generate_thumb_from_current" />
        </Dropdown.Item>
        <Dropdown.Item
          key="generate-default"
          className="bg-secondary text-white"
          onClick={() => onGenerateScreenshot()}
        >
          <FormattedMessage id="actions.generate_thumb_default" />
        </Dropdown.Item>
        {boxes.length > 0 && (
          <Dropdown.Item
            key="submit"
            className="bg-secondary text-white"
            onClick={() => setShowDraftModal(true)}
          >
            <FormattedMessage id="actions.submit_stash_box" />
          </Dropdown.Item>
        )}
        <Dropdown.Item
          key="delete-scene"
          className="bg-secondary text-white"
          onClick={() => setIsDeleteAlertOpen(true)}
        >
          <FormattedMessage
            id="actions.delete_entity"
            values={{ entityType: intl.formatMessage({ id: "scene" }) }}
          />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
  const onIncrementClick = async () => {
    try {
      await incrementO();
    } catch (e) {
      Toast.error(e);
    }
  };

  const onDecrementClick = async () => {
    try {
      await decrementO();
    } catch (e) {
      Toast.error(e);
    }
  };
  const onOrganizedClick = async () => {
    try {
      setOrganizedLoading(true);
      await updateScene({
        variables: {
          input: {
            id: scene.id,
            organized: !scene.organized,
          },
        },
      });
    } catch (e) {
      Toast.error(e);
    } finally {
      setOrganizedLoading(false);
    }
  };

  const onResetClick = async () => {
    try {
      await resetO();
    } catch (e) {
      Toast.error(e);
    }
  };
  const renderButtons = () => (
    <ButtonGroup className="ml-auto">
    <Nav.Item className="ml-auto">
      <ExternalPlayerButton scene={scene} />
    </Nav.Item>
    <Nav.Item className="ml-auto">
      <OCounterButton
        value={scene.o_counter || 0}
        onIncrement={onIncrementClick}
        onDecrement={onDecrementClick}
        onReset={onResetClick}
      />
    </Nav.Item>
    <Nav.Item>
      <OrganizedButton
        loading={organizedLoading}
        organized={scene.organized}
        onClick={onOrganizedClick}
      />
    </Nav.Item>
    <Nav.Item>
      <Button
      className="btn-clear"
      onClick={()=>setWideMode()}
      >
        <Icon icon={faArrowsLeftRightToLine}/>
      </Button>
    </Nav.Item>
    <Nav.Item>
      <Button
      className="btn-clear"
      onClick={() => setEditMode()}
      >
        <FormattedMessage id="actions.edit"/>
      </Button>
    </Nav.Item>
    <Nav.Item>{renderOperations()}</Nav.Item>
  </ButtonGroup>
  )
  return <>{renderButtons()}</>
};
const QueueBar: React.FC<IProps> = ({
  scene,
  queueScenes,
  onQueueNext,
  onQueuePrevious,
  onQueueRandom,
  onQueueSceneClicked,
  continuePlaylist,
  queueHasMoreScenes,
  onQueueMoreScenes,
  onQueueLessScenes,
  queueStart,
  collapsed,
  setCollapsed,
  setContinuePlaylist,
}) => {
  const Toast = useToast();
  const intl = useIntl();

  const renderTabs = () => (
  <>
      <QueueViewer
        scenes={queueScenes}
        currentID={scene.id}
        continue={continuePlaylist}
        setContinue={setContinuePlaylist}
        onSceneClicked={onQueueSceneClicked}
        onNext={onQueueNext}
        onPrevious={onQueuePrevious}
        onRandom={onQueueRandom}
        start={queueStart}
        hasMoreScenes={queueHasMoreScenes}
        onLessScenes={onQueueLessScenes}
        onMoreScenes={onQueueMoreScenes}
    />
  </>

  );

  const title = objectTitle(scene);

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div
        className="potato"

      >
        {renderTabs()}
      </div>
    </>
  );
};

const SceneLoader: React.FC<RouteComponentProps<ISceneParams>> = ({
  location,
  history,
  match,
}) => {
  const { id } = match.params;
  const { configuration } = useContext(ConfigurationContext);
  const { data, loading, error } = useFindScene(id);

  const [scene, setScene] = useState<GQL.SceneDataFragment>();
  const file = useMemo(
    () => (scene?.files.length! > 0 ? scene?.files[0] : undefined),
    [scene]
  );
  const [sBCollapsed, setSBCollapsed] = useState(false)
  const [wideMode, setWideMode] = useState(false)
  const [editMode, setEditMode] = useState(false)
  function getCollapseButtonIcon() {
    return !sBCollapsed ? faChevronRight : faChevronLeft;
  }
  // useLayoutEffect to update before paint
  useLayoutEffect(() => {
    // only update scene when loading is done
    if (!loading) {
      setScene(data?.findScene ?? undefined);
    }
  }, [data, loading]);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const sceneQueue = useMemo(
    () => SceneQueue.fromQueryParameters(queryParams),
    [queryParams]
  );
  const queryContinue = useMemo(() => {
    let cont = queryParams.get("continue");
    if (cont) {
      return cont === "true";
    } else {
      return !!configuration?.interface.continuePlaylistDefault;
    }
  }, [configuration?.interface.continuePlaylistDefault, queryParams]);

  const [queueScenes, setQueueScenes] = useState<QueuedScene[]>([]);
  const [updateScene] = useSceneUpdate();
  const Toast = useToast();
  const intl = useIntl();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState(false);
  const [continuePlaylist, setContinuePlaylist] = useState(queryContinue);
  const [hideScrubber, setHideScrubber] = useState(
    !(configuration?.interface.showScrubber ?? true)
  );

  const _setTimestamp = useRef<(value: number) => void>();
  const initialTimestamp = useMemo(() => {
    return Number.parseInt(queryParams.get("t") ?? "0", 10);
  }, [queryParams]);

  const [queueTotal, setQueueTotal] = useState(0);
  const [queueStart, setQueueStart] = useState(1);

  const autoplay = queryParams.get("autoplay") === "true";
  const autoPlayOnSelected =
    configuration?.interface.autostartVideoOnPlaySelected ?? false;

  const currentQueueIndex = useMemo(
    () => queueScenes.findIndex((s) => s.id === id),
    [queueScenes, id]
  );

  function getSetTimestamp(fn: (value: number) => void) {
    _setTimestamp.current = fn;
  }

  function setTimestamp(value: number) {
    if (_setTimestamp.current) {
      _setTimestamp.current(value);
    }
  }

  // set up hotkeys
  useEffect(() => {
    Mousetrap.bind(".", () => setHideScrubber((value) => !value));

    return () => {
      Mousetrap.unbind(".");
    };
  }, []);

  async function getQueueFilterScenes(filter: ListFilterModel) {
    const query = await queryFindScenes(filter);
    const { scenes, count } = query.data.findScenes;
    setQueueScenes(scenes);
    setQueueTotal(count);
    setQueueStart((filter.currentPage - 1) * filter.itemsPerPage + 1);
  }

  async function getQueueScenes(sceneIDs: number[]) {
    const query = await queryFindScenesByID(sceneIDs);
    const { scenes, count } = query.data.findScenes;
    setQueueScenes(scenes);
    setQueueTotal(count);
    setQueueStart(1);
  }

  useEffect(() => {
    if (sceneQueue.query) {
      getQueueFilterScenes(sceneQueue.query);
    } else if (sceneQueue.sceneIDs) {
      getQueueScenes(sceneQueue.sceneIDs);
    }
  }, [sceneQueue]);

  async function onQueueLessScenes() {
    if (!sceneQueue.query || queueStart <= 1) {
      return;
    }

    const filterCopy = sceneQueue.query.clone();
    const newStart = queueStart - filterCopy.itemsPerPage;
    filterCopy.currentPage = Math.ceil(newStart / filterCopy.itemsPerPage);
    const query = await queryFindScenes(filterCopy);
    const { scenes } = query.data.findScenes;

    // prepend scenes to scene list
    const newScenes = (scenes as QueuedScene[]).concat(queueScenes);
    setQueueScenes(newScenes);
    setQueueStart(newStart);

    return scenes;
  }

  const queueHasMoreScenes = useMemo(() => {
    return queueStart + queueScenes.length - 1 < queueTotal;
  }, [queueStart, queueScenes, queueTotal]);

  async function onQueueMoreScenes() {
    if (!sceneQueue.query || !queueHasMoreScenes) {
      return;
    }

    const filterCopy = sceneQueue.query.clone();
    const newStart = queueStart + queueScenes.length;
    filterCopy.currentPage = Math.ceil(newStart / filterCopy.itemsPerPage);
    const query = await queryFindScenes(filterCopy);
    const { scenes } = query.data.findScenes;

    // append scenes to scene list
    const newScenes = queueScenes.concat(scenes);
    setQueueScenes(newScenes);
    // don't change queue start
    return scenes;
  }

  function loadScene(sceneID: string, autoPlay?: boolean, newPage?: number) {
    const sceneLink = sceneQueue.makeLink(sceneID, {
      newPage,
      autoPlay,
      continue: continuePlaylist,
    });
    history.replace(sceneLink);
  }

  async function queueNext(autoPlay: boolean) {
    if (currentQueueIndex === -1) return;

    if (currentQueueIndex < queueScenes.length - 1) {
      loadScene(queueScenes[currentQueueIndex + 1].id, autoPlay);
    } else {
      // if we're at the end of the queue, load more scenes
      if (currentQueueIndex === queueScenes.length - 1 && queueHasMoreScenes) {
        const loadedScenes = await onQueueMoreScenes();
        if (loadedScenes && loadedScenes.length > 0) {
          // set the page to the next page
          const newPage = (sceneQueue.query?.currentPage ?? 0) + 1;
          loadScene(loadedScenes[0].id, autoPlay, newPage);
        }
      }
    }
  }

  async function queuePrevious(autoPlay: boolean) {
    if (currentQueueIndex === -1) return;

    if (currentQueueIndex > 0) {
      loadScene(queueScenes[currentQueueIndex - 1].id, autoPlay);
    } else {
      // if we're at the beginning of the queue, load the previous page
      if (queueStart > 1) {
        const loadedScenes = await onQueueLessScenes();
        if (loadedScenes && loadedScenes.length > 0) {
          const newPage = (sceneQueue.query?.currentPage ?? 0) - 1;
          loadScene(
            loadedScenes[loadedScenes.length - 1].id,
            autoPlay,
            newPage
          );
        }
      }
    }
  }

  async function queueRandom(autoPlay: boolean) {
    if (sceneQueue.query) {
      const { query } = sceneQueue;
      const pages = Math.ceil(queueTotal / query.itemsPerPage);
      const page = Math.floor(Math.random() * pages) + 1;
      const index = Math.floor(
        Math.random() * Math.min(query.itemsPerPage, queueTotal)
      );
      const filterCopy = sceneQueue.query.clone();
      filterCopy.currentPage = page;
      const queryResults = await queryFindScenes(filterCopy);
      if (queryResults.data.findScenes.scenes.length > index) {
        const { id: sceneID } = queryResults.data.findScenes.scenes[index];
        // navigate to the image player page
        loadScene(sceneID, autoPlay, page);
      }
    } else if (queueTotal !== 0) {
      const index = Math.floor(Math.random() * queueTotal);
      loadScene(queueScenes[index].id, autoPlay);
    }
  }

  function onComplete() {
    // load the next scene if we're continuing
    if (continuePlaylist) {
      queueNext(true);
    }
  }

  function onDelete() {
    if (
      continuePlaylist &&
      currentQueueIndex >= 0 &&
      currentQueueIndex < queueScenes.length - 1
    ) {
      loadScene(queueScenes[currentQueueIndex + 1].id);
    } else {
      history.push("/scenes");
    }
  }

  function getScenePage(sceneID: string) {
    if (!sceneQueue.query) return;

    // find the page that the scene is on
    const index = queueScenes.findIndex((s) => s.id === sceneID);

    if (index === -1) return;

    const perPage = sceneQueue.query.itemsPerPage;
    return Math.floor((index + queueStart - 1) / perPage) + 1;
  }

  function onQueueSceneClicked(sceneID: string) {
    loadScene(sceneID, autoPlayOnSelected, getScenePage(sceneID));
  }

  if (!scene) {
    if (loading) return <LoadingIndicator />;
    if (error) return <ErrorMessage error={error.message} />;
    return <ErrorMessage error={`No scene found with id ${id}.`} />;
  }
  function maybeRenderTags() {
    return scene!.tags.length != 0 ? (
      <div
      className="d-flex flex-wrap justify-content-start align-items-start align-content-start h-fc" 
      >
        <TagButtons scene={scene!}/>
      </div>
    ) : ("")
  }
  function maybeRenderPerformers() {
    return scene!.performers.length != 0 ? (
      <div className="d-flex flex-wrap justify-content-start align-content-start" style={{
      minWidth: scene!.performers.length > 1 ? "400px" : "",
      maxWidth: "400px"
      }} key={scene!.id}><PerformerButtons scene={scene!}/></div>
    ) : ("")
  }
  const sbStuff = 
  <div className="rec-row d-flex flex-col" style={{
    width: sBCollapsed ? "0" : "calc(20vw + 15px)",
    
  }}>
      <SceneRecs 
      key={Math.random()}
      scene={scene}
      queue={
        <QueueBar
        scene={scene}
        setTimestamp={setTimestamp}
        queueScenes={queueScenes}
        queueStart={queueStart}
        onDelete={onDelete}
        onQueueNext={() => queueNext(autoPlayOnSelected)}
        onQueuePrevious={() => queuePrevious(autoPlayOnSelected)}
        onQueueRandom={() => queueRandom(autoPlayOnSelected)}
        onQueueSceneClicked={onQueueSceneClicked}
        continuePlaylist={continuePlaylist}
        queueHasMoreScenes={queueHasMoreScenes}
        onQueueLessScenes={onQueueLessScenes}
        onQueueMoreScenes={onQueueMoreScenes}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setContinuePlaylist={setContinuePlaylist}
      />
      }
      />
  </div>

  async function onSave(input: GQL.SceneCreateInput) {
    await updateScene({
      variables: {
        input: {
          id: scene!.id,
          ...input,
        },
      },
    });
    Toast.success(
      intl.formatMessage(
        { id: "toast.updated_entity" },
        { entity: intl.formatMessage({ id: "scene" }).toLocaleLowerCase() }
      )
    );
  }
  return (
    <div 
    className="the-window"
    style={{
    height: "calc(100vh - 4rem)"
    }}>
      <div className="d-flex flex-row" style={{height: "100%"}}>
        <div className={`the-vert h-fc h-100 ${sBCollapsed || wideMode ? "expand": ""}`}>
          <div className="scene-player-container mb-3">
            <ScenePlayer
              key="ScenePlayer"
              scene={scene}
              hideScrubberOverride={hideScrubber}
              autoplay={autoplay}
              permitLoop={!continuePlaylist}
              initialTimestamp={initialTimestamp}
              sendSetTimestamp={getSetTimestamp}
              onComplete={onComplete}
              onNext={() => queueNext(true)}
              onPrevious={() => queuePrevious(true)}
              />
          </div>
          <div className="d-flex flex-row under-player">
            {!editMode ? 
              <div className="the-deets" style={{margin: "0 15px", width: "-webkit-fill-available"}}>
              <div className="top-row d-flex flex-row justify-content-between">

                <div className="left-side w-100">
                  <div className="d-flex">
                    <h3>{scene.title}</h3>
                    <div className="flex-grow-1"></div>
                    <div className="d-flex flex-row mb-3" >
                      <UtilityBar 
                      scene={scene}
                      setWideMode={() => setWideMode(!wideMode)}
                      setEditMode={() => setEditMode(!editMode)}
                      />
                    </div>
                  </div>
                  <div className="studio-row">
                    <Link to={`/studios/${scene.studio?.id}`} className="studio-row d-flex flex-row link w-fc">
                        <img src={scene.studio?.image_path ?? ""} style={{height: "3rem", width: "3rem", borderRadius: "999px"}} className="mb-2"></img>
                        <h5 className="ml-2 d-flex align-items-center">{scene.studio?.name}</h5>
                    </Link>
                  </div>
                  <div className="date-row">
                    <h6>{scene.date}</h6>
                  </div>
                    {file?.width && file?.height && (
                    <h6>
                      <FormattedMessage id="resolution" />:{" "}
                      {TextUtils.resolution(file.width, file.height)}
                    </h6>
                    )}
                <div className="tags-performers">
                
                <div>
                {scene.tags.length > 0 ? <h5>Tags</h5> : ""}
                {maybeRenderTags()}
                {scene.details? <h5>Description</h5> : ""}
                <span>
                  {scene.details}
                </span>
                </div>
                <div>
                  {scene.performers.length > 0 ?
                  <h5
                    className="text-right"
                  >
                    Performers
                  </h5> : ""
                  }
                  {maybeRenderPerformers()}
                </div>
                </div>
                </div>
              </div>
            </div>
            : 
            <SceneEditPanel 
              scene={scene}
              isVisible={editMode}
              onSubmit={onSave}
              onDelete={() => setIsDeleteAlertOpen(true)}
              setEditMode={() => setEditMode(false)}
            />
            }
            {wideMode ? sbStuff : ""}
          </div>
        </div>
        {!wideMode ? 
          sbStuff : ""
        }
      </div>
    </div>
  );
};

export default SceneLoader;