import React from "react";
import * as GQL from "src/core/generated-graphql";
import { SceneQueue } from "src/models/sceneQueue";
import { useContainerDimensions } from "../Shared/GridCard/GridCard";
import { SceneCard } from "../Scenes/SceneCard";
import { Button } from "react-bootstrap";

interface IProps {
  onChange: (index:number) => void
  tagBools: any[] | undefined
}
export const RecommendsTags: React.FC<IProps> = ({
  onChange,
  tagBools 
}) => { 
  var tagsToDisplay = tagBools?.map((tag, index) => (
      <>
          <Button 
              className={tag![1] ? "btn-success mr-2" : "btn-danger mr-2"}
              style={{height: "fit-content"}}
              onClick={() => {
                  onChange(index)
                  tagBools[index][1] = !tagBools[index][1]
                  console.info(tagBools[index][1]) // Debugging that shows that the variable is being changed
              }}
          >
              {tag![0].name}
          </Button>
      </>
      ))
  return <>{tagsToDisplay}</>;
};