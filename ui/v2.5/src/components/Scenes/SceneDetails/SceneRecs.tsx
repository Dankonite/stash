import React, { useState } from "react";
import { RecommendsGrid } from "src/components/Recommendations/RecommendsGrid";
import * as GQL from "src/core/generated-graphql";
import { RecommendsCol } from "./RecommendsGrid";
import { remove } from "lodash-es";
import { Button } from "react-bootstrap";
interface IProps {
    scene: GQL.SlimSceneDataFragment;

}

export const SceneRecs: React.FC<IProps> = ({
    scene,
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
                scenes={uniqued.slice(0, 10)}
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
                scenes={uniqued.slice(0,10)}
                />
        return content
    }
    function hasStudio() {
        const combined:GQL.SlimSceneDataFragment[] = []
        const dummy:GQL.SlimSceneDataFragment[] = []
        perfIds.map((id) => combined.push.apply(combined, getSameStudio(id)))
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id)))
        perfIds.map((id) => dummy.push.apply(dummy, getSamePerf(id)))
        console.info("Only displaying " + scene.studio!.name)
        const uniqued = removeDuplicates(combined)
        const sceneIds = uniqued.map((item) => item.id)
        uniqued.splice(sceneIds.indexOf(scene.id), 1)
        const content = 
            <RecommendsCol 
                key={Math.random()}
                scenes={uniqued.slice(0,10)}
                />
        return content
    }
    function isNotNull(value:any) {
        return value != ""
    }
    const [isAll, setIsAll] = useState(true)
    const [isPerformers, setIsPerformers] = useState(false)
    const [isStudio, setIsStudio] = useState(false)
    const [isQueue, setIsQueue] = useState(false)
    function render() {
        const performersFemale = scene.performers.map((performer) => performer.gender === "FEMALE" ? performer.name : "").filter(isNotNull)
        var content = scene.performers.length != 0 && scene.studio && isAll ? hasStudioAndPerf()
                    : scene.performers.length > 0 && isPerformers ? hasPerf()
                    : scene.studio && isStudio ? hasStudio()
                    : undefined
        const display = 
        <>
            <div className="d-flex flex-row ml-1">
                {performersFemale.length != 0 && scene.studio ?
                    <Button 
                    className={`${isAll ? "btn-dc" : "btn-secondary"} btn-1l mr-2`}
                    onClick={() => {
                        setIsStudio(false)
                        setIsAll(true)
                        setIsPerformers(false)
                    }}
                    >
                    All
                    </Button>
                    : ""
                }
                {scene.performers.length != 0 ? 
                    <Button 
                    className={`${isPerformers ? "btn-dc" : "btn-secondary"} btn-1l mr-2`}
                    onClick={() => {
                        setIsStudio(false)
                        setIsAll(false)
                        setIsPerformers(true)
                    }}
                    >
                    {performersFemale.length > 1 ? "Performers" : performersFemale[0]}
                    </Button>
                    : ""
                }
                {scene.studio ? 
                    <Button 
                    className={`${isStudio ? "btn-dc" : "btn-secondary"} btn-1l mr-2`}
                    onClick={() => {
                        setIsStudio(true)
                        setIsAll(false)
                        setIsPerformers(false)
                    }}
                    >
                    {scene.studio!.name}
                    </Button>
                    : ""
                }
            </div>
            {content}
        </>
        return content ? display : null
    }
    
    
    return render()
}