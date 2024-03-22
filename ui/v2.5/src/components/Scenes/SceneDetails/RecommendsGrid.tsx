import React from "react";
import { useContainerDimensions } from "src/components/Shared/GridCard/GridCard";
import * as GQL from "src/core/generated-graphql";
import { SceneQueue } from "src/models/sceneQueue";
import { SceneCard } from "../SceneCard";


interface ISceneCardsGrid {
  scenes: GQL.SlimSceneDataFragment[];
  queue?: SceneQueue;
  zoomIndex?: number;
}

export const RecommendsCol: React.FC<ISceneCardsGrid> = ({
  scenes,
  queue,
  zoomIndex,
}) => {
  const [componentRef, { width }] = useContainerDimensions();
  return (
    <div className="justify-content-center" ref={componentRef}>
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