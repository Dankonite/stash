import React, { useState } from "react";
import { RecommendsGrid } from "src/components/Recommendations/RecommendsGrid";
import * as GQL from "src/core/generated-graphql";
import { RecommendsCol } from "./RecommendsGrid";
import { remove } from "lodash-es";
import { Button } from "react-bootstrap";
import { MarkerWallPanel } from "src/components/Wall/WallPanel copy";
interface IProps {
    scene: GQL.SceneDataFragment;
    queue: JSX.Element
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
    queue
}) => {
    const perfIds = scene.performers.map((performer) => performer.id)
    function getSameStudioPerf(id: string):GQL.SlimSceneDataFragment[] {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    sort: "random"
                },
                scene_filter: {
                    performers: {
                        value: [id],
                        modifier: GQL.CriterionModifier.Includes
                    },
                    studios: {
                        value: [scene.studio!.id],
                        modifier: GQL.CriterionModifier.Includes
                    }
                }
            }
        })
        return data?.findScenes?.scenes!
    }
    function getSameStudio(id: string):GQL.SlimSceneDataFragment[] {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    sort: "random"
                },
                scene_filter: {
                    studios: {
                        value: [scene.studio!.id],
                        modifier: GQL.CriterionModifier.Includes
                    }
                }
            }
        })
        return data?.findScenes?.scenes!
    }
    function getSamePerf (id: string) {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    sort: "random"
                },
                scene_filter: {
                    performers: {
                        value: [id],
                        modifier: GQL.CriterionModifier.Includes
                    }
                }
            }
        })
        return data?.findScenes?.scenes!
    }
    function removeDuplicates(scenes: GQL.SlimSceneDataFragment[]) {
        var uniqueNum:number[] = [];
        var uniqueScenes: GQL.SlimSceneDataFragment[] = [];
        for (var i = 0; i < scenes.length; i++) {
            if (uniqueNum.indexOf(Number(scenes[i].id)) === -1) {
                uniqueNum.push(Number(scenes[i].id));
                uniqueScenes.push(scenes[i])
            }
        }
        return uniqueScenes;
    }
    function hasStudioAndPerf() {
        const combined:GQL.SlimSceneDataFragment[] = []
        perfIds.map((id) => combined.push.apply(combined, getSameStudioPerf(id)))
        perfIds.map((id) => combined.push.apply(combined, getSamePerf(id)))
        perfIds.map((id) => combined.push.apply(combined, getSameStudio(id)))
        console.info("Displaying all")
        const uniqued = removeDuplicates(combined)
        const sceneIds = uniqued.map((item) => item.id)
        uniqued.splice(sceneIds.indexOf(scene.id), 1)
        const content = 
            <RecommendsCol
                key={Math.random()}
                scenes={uniqued.slice(0, 40)}
                />
        return content
    }
    function hasPerf() {
        const combined:GQL.SlimSceneDataFragment[] = []
        const dummy:GQL.SlimSceneDataFragment[] = []
        perfIds.map((id) => combined.push.apply(combined, getSamePerf(id)))
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id)))
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id)))
        console.info("Only displaying performers")
        const uniqued = removeDuplicates(combined)
        const sceneIds = uniqued.map((item) => item.id)
        uniqued.splice(sceneIds.indexOf(scene.id), 1)
        const content = 
            <RecommendsCol 
                key={Math.random()}
                scenes={uniqued.slice(0,40)}
                />
        return content
    }
    function markers() {
        const content = 
            <MarkerView scene={scene}/>
        return content
    }
    function isNotNull(value:any) {
        return value != ""
    }
    const [isRecommended, setIsRecommended] = useState(true)
    const [isMarkers, setIsMarkers] = useState(false)
    const [isQueue, setIsQueue] = useState(false)
    const recContent = hasStudioAndPerf()
    const markerContent = markers()
    function render() {
        var content = scene.performers.length != 0 && scene.studio && isRecommended ? recContent
                    : scene.performers.length > 0 && isQueue ? queue
                    : scene.studio && isMarkers ? markerContent
                    : undefined
        const display = 
        <>
            <div className="d-flex flex-row ml-1 mb-2" key={Math.random()}>

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
                className={`${isQueue ? "btn-dc" : "btn-secondary"} btn-1l mr-2`}
                onClick={() => {
                    setIsMarkers(false)
                    setIsRecommended(false)
                    setIsQueue(true)
                }}
                >
                Queue
                </Button>
                <Button 
                className={`${isMarkers ? "btn-dc" : "btn-secondary"} btn-1l`}
                onClick={() => {
                    setIsMarkers(true)
                    setIsRecommended(false)
                    setIsQueue(false)
                }}
                >
                Markers
                </Button>
            </div>
            {content}
        </>
        return content ? display : null
    }
    
    
    return render()
}