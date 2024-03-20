import React, { Dispatch, SetStateAction, useState } from "react";
import * as GQL from "src/core/generated-graphql";
import { SceneQueue } from "src/models/sceneQueue";
import { useContainerDimensions } from "../Shared/GridCard/GridCard";
import { SceneCard } from "../Scenes/SceneCard";
import { Button } from "react-bootstrap";

interface IProps {
  tagBools: any[] | undefined
  includeAll: boolean
  setIncludeAll: Dispatch<SetStateAction<boolean>>
  debug?: () => void
}
export const RecommendsTags: React.FC<IProps> = ({
  tagBools,
  debug,
  includeAll,
  setIncludeAll
}) => {
  const [test, setTest] = useState(1)
  const tagsToDisplay = tagBools?.map((tag, index) => (
      <div>
          <Button 
              className={tag![1] ? "btn-success mr-2 mb-2" : "btn-danger mr-2 mb-2"}
              style={{height: "fit-content"}}
              onClick={() => {
                  tagBools[index][1] = !tagBools[index][1]
                  setTest(test + 1)
              }}
          >
              {tag![0].name}
          </Button>
      </div>
      ))
  const includeAllButton = <>
    <Button
      className={includeAll ? "mr-3 mb-2 btn-success" : "mr-3 mb-2 btn-danger"}
      style={{height: "fit-content"}}
      onClick={() => {
        setIncludeAll(!includeAll)
        setTest(test + 1)
      }}
      >
        Req All
    </Button>
  </>
  return <>
          <div key={test} className="d-flex" style={{flexWrap: "wrap"}}>
            {includeAllButton}
            {tagsToDisplay}
          </div>
         </>;
};