import React, { useEffect, useState } from "react";
import { RecommendsGrid } from "src/components/Recommendations/RecommendsGrid";
import * as GQL from "src/core/generated-graphql";
import { RecommendsCol } from "./RecommendsGrid";
import { remove } from "lodash-es";
import { Button } from "react-bootstrap";
import { MarkerWallPanel } from "src/components/Wall/WallPanel copy";
import { useStats } from "src/core/StashService";
import { TypeKind } from "graphql";
import { LoadingIndicator } from "src/components/Shared/LoadingIndicator";
interface IProps {
    scene: GQL.SceneDataFragment;
    queue: JSX.Element;
    seed: number
}
interface markersProps {
scene:GQL.SceneDataFragment
}

const MarkerView: React.FC<markersProps> = ({
    scene,
}) => {
    const { data, loading } = GQL.useFindSceneMarkerTagsQuery({
        variables: { id: scene.id },
        });
    const sceneMarkers = (
        data?.sceneMarkerTags.map((tag) => tag.scene_markers) ?? []
        ).reduce((prev, current) => [...prev, ...current], []);
    const markers = 
        <MarkerWallPanel
        markers={sceneMarkers}
        clickHandler={(e, marker) => {
        e.preventDefault();
        window.scrollTo(0, 0);
        }}
        />
return (
    <>{markers}</>
)
}
export const SceneRecs: React.FC<IProps> = ({
    scene,
    queue,
    seed
}) => { 
    function studioNext() {
        const {data, loading} = GQL.useFindScenesQuery({
          variables: {
            filter: {
              per_page: 15,
              sort: "random_" + seed,
    
            },
            scene_filter: {
              studios: {
                modifier: GQL.CriterionModifier.Includes,
                value: [scene.studio!.id],
              }
            }
          }
        })
        return data?.findScenes.scenes
        }
        
    function recommendedContent() {
        const content = 
            <RecommendsCol
                key={1}
                scenes={studioNext()}
                />
        return content
    }
    function markers() {
        const content =
        <MarkerView scene={scene}/>
        return content
    }
    const [isRecommended, setIsRecommended] = useState(true)
    const [isMarkers, setIsMarkers] = useState(false)
    const [isQueue, setIsQueue] = useState(false)
    const recContent = recommendedContent()
    const markerContent = markers()
    function render() {
        var content = isRecommended ? recContent
                    : isQueue ? queue
                    : isMarkers ? markerContent
                    : undefined
        
        const display = 
        <>
            <div className="d-flex flex-row ml-1 mb-2" key={1}>

                <Button 
                className={`${isRecommended ? "btn-dc" : "btn-secondary"} btn-1l`}
                onClick={() => {
                    setIsMarkers(false)
                    setIsRecommended(true)
                    setIsQueue(false)
                }}
                >
                Recommended
                </Button>
                <div className="flex-grow-1"></div>
                <Button 
                className={`${isQueue ? "btn-dc" : "btn-secondary"} btn-1l`}
                onClick={() => {
                    setIsMarkers(false)
                    setIsRecommended(false)
                    setIsQueue(true)
                }}
                >
                Queue
                </Button>
                {scene.scene_markers.length > 0 ? <Button 
                className={`${isMarkers ? "btn-dc" : "btn-secondary"} btn-1l`}
                onClick={() => {
                    setIsMarkers(true)
                    setIsRecommended(false)
                    setIsQueue(false)
                }}
                >
                Markers
                </Button> : <></>}
            </div>
            {content ? content : <LoadingIndicator />}
            
        </>
        return content ? display : null
    }
    
    
    return render()
}