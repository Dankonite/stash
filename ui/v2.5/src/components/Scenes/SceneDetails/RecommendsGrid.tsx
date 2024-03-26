import React, { useEffect, useMemo, useRef } from "react";
import { useContainerDimensions } from "src/components/Shared/GridCard/GridCard";
import * as GQL from "src/core/generated-graphql";
import { SceneQueue } from "src/models/sceneQueue";
import { SceneCard } from "../SceneCard";
import { Link, useHistory } from "react-router-dom";
import { objectTitle } from "src/core/files";
import { PreviewScrubber } from "../PreviewScrubber";
import cx from "classnames";
import { ConfigurationContext } from "src/hooks/Config";

interface ISceneCardsGrid {
  scenes: GQL.SlimSceneDataFragment[] | undefined;
  queue?: SceneQueue;
  zoomIndex?: number;
}
interface IScenePreviewProps {
  isPortrait: boolean;
  image?: string;
  video?: string;
  soundActive: boolean;
  vttPath?: string;
  onScrubberClick?: (timestamp: number, scene: GQL.SlimSceneDataFragment) => void;
}
export const ScenePreview: React.FC<IScenePreviewProps> = ({
  image,
  video,
  isPortrait,
  soundActive,
  vttPath,
  onScrubberClick,
}) => {
  const videoEl = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0)
          // Catch is necessary due to DOMException if user hovers before clicking on page
          videoEl.current?.play()?.catch(() => {});
        else videoEl.current?.pause();
      });
    });

    if (videoEl.current) observer.observe(videoEl.current);
  });

  useEffect(() => {
    if (videoEl?.current?.volume)
      videoEl.current.volume = soundActive ? 0.05 : 0;
  }, [soundActive]);

  return (
    <div className={cx("scene-card-preview", { portrait: isPortrait })}>
      <img
        className="scene-card-preview-image"
        loading="lazy"
        src={image}
        alt=""
      />
      <video
        disableRemotePlayback
        playsInline
        muted={!soundActive}
        className="scene-card-preview-video"
        loop
        preload="none"
        ref={videoEl}
        src={video}
      />
    </div>
  );
};
export const RecommendsCol: React.FC<ISceneCardsGrid> = ({
  scenes,
  queue,
  zoomIndex,
}) => {
  const [componentRef, { width }] = useContainerDimensions();
  const { configuration } = React.useContext(ConfigurationContext);
  const history = useHistory();
  function onScrubberClick(timestamp: number, scene: GQL.SlimSceneDataFragment) {
    const link = queue
      ? queue.makeLink(scene.id, {
          sceneIndex: 1,
          continue: false,
          start: timestamp,
        })
      : `/scenes/${scene.id}?t=${timestamp}`;

    history.push(link);
  }
  if (scenes) {return (
    <div id="queue-viewer">
    <div className="justify-content-center queue-content" ref={componentRef}>
      {scenes.map((scene, index) => (
        <Link
        to={`/scenes/${scene.id}`}
        >
          <div className="ml-1 d-flex align-items-start">
            <div className="thumbnail-container">
            <ScenePreview
              image={scene.paths.screenshot ?? undefined}
              video={scene.paths.preview ?? undefined}
              isPortrait={true}
              soundActive={configuration?.interface?.soundOnPreview ?? false}
              vttPath={scene.paths.vtt ?? undefined}
            />
            </div>
            <div className="queue-scene-details d-flex flex-col">
            <span className="queue-scene-title">{objectTitle(scene)}</span>
            <span className="queue-scene-studio">{scene?.studio?.name}</span>
            <span className="queue-scene-performers">
                {scene?.performers
                ?.map(function (performer) {
                    return performer.name;
                })
                .join(", ")}
            </span>
            <span className="queue-scene-date">{scene?.date}</span>
            </div>
        </div>
        </Link>
      ))}
    </div>
    </div>
  )} else return null
};