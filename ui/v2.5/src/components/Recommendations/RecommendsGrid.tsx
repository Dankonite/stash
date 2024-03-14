import React from "react";
import * as GQL from "src/core/generated-graphql";
import { SceneQueue } from "src/models/sceneQueue";
import { useContainerDimensions } from "../Shared/GridCard/GridCard";
import { SceneCard } from "../Scenes/SceneCard";

interface ISceneCardsGrid {
  scenes: GQL.SlimSceneDataFragment[];
  queue?: SceneQueue;
  zoomIndex: number;
}

export const RecommendsGrid: React.FC<ISceneCardsGrid> = ({
  scenes,
  queue,
  zoomIndex,
}) => {
  const [componentRef, { width }] = useContainerDimensions();
  return (
    <div className="row justify-content-center" ref={componentRef}>
      {scenes.map((scene, index) => (
        <SceneCard
          key={scene.id}
          containerWidth={width}
          scene={scene}
          queue={queue}
          index={index}
          zoomIndex={zoomIndex}
        />
      ))}
    </div>
  );
};