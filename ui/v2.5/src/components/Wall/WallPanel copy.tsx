import React, { MouseEvent } from "react";
import * as GQL from "src/core/generated-graphql";
import { SceneQueue } from "src/models/sceneQueue";
import { WallItem, WallItemData, WallItemType } from "./WallItem copy";

interface IWallPanelProps<T extends WallItemType> {
  type: T;
  data: WallItemData[T][];
  sceneQueue?: SceneQueue;
  clickHandler?: (e: MouseEvent, item: WallItemData[T]) => void;
}

const calculateClass = (index: number, count: number) => {
  // // First
  if (index === 0) return "transform-origin-top-right";
  // Last
  if (index + 1 === count)
    return "transform-origin-bottom-right";
  // // Default
  return "transform-origin-right";
};

const WallPanel = <T extends WallItemType>({
  type,
  data,
  sceneQueue,
  clickHandler,
}: IWallPanelProps<T>) => {
  function renderItems() {
    return data.map((item, index, arr) => (
      <WallItem
        type={type}
        key={item.id}
        index={index}
        data={item}
        sceneQueue={sceneQueue}
        clickHandler={clickHandler}
        className={calculateClass(index, arr.length)}
      />
    ));
  }

  return (
    <div className="">
      <div className="wall w-100 justify-content-center">
        {renderItems()}
      </div>
    </div>
  );
};

interface IImageWallPanelProps {
  images: GQL.SlimImageDataFragment[];
  clickHandler?: (e: MouseEvent, item: GQL.SlimImageDataFragment) => void;
}

export const ImageWallPanel: React.FC<IImageWallPanelProps> = ({
  images,
  clickHandler,
}) => {
  return <WallPanel type="image" data={images} clickHandler={clickHandler} />;
};

interface IMarkerWallPanelProps {
  markers: GQL.SceneMarkerDataFragment[];
  clickHandler?: (e: MouseEvent, item: GQL.SceneMarkerDataFragment) => void;
}

export const MarkerWallPanel: React.FC<IMarkerWallPanelProps> = ({
  markers,
  clickHandler,
}) => {
  return (
    <WallPanel type="sceneMarker" data={markers} clickHandler={clickHandler} />
  );
};

interface ISceneWallPanelProps {
  scenes: GQL.SlimSceneDataFragment[];
  sceneQueue?: SceneQueue;
  clickHandler?: (e: MouseEvent, item: GQL.SlimSceneDataFragment) => void;
}

export const SceneWallPanel: React.FC<ISceneWallPanelProps> = ({
  scenes,
  sceneQueue,
  clickHandler,
}) => {
  return (
    <WallPanel
      type="scene"
      data={scenes}
      sceneQueue={sceneQueue}
      clickHandler={clickHandler}
    />
  );
};
