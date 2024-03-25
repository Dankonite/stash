import React, { useEffect, useRef, useState } from "react";
import * as GQL from "src/core/generated-graphql";
import { faGear, faShuffle } from "@fortawesome/free-solid-svg-icons";
import { RecommendsGrid } from "./RecommendsGrid";
import { Button, Form, Modal } from "react-bootstrap";
import { Icon } from "../Shared/Icon";
import { RecommendsTags } from "./RecommendsTags";
import { includes } from "lodash-es";
import { useStats } from "src/core/StashService";


interface IProps {
}
export const RecommendationList: React.FC<IProps> = ({
}) => {
    const defaultCount:string = "15"
    const [randomSeed, setRandomSeed] = useState(Math.random()*10000000)
    const [shuffle, setShuffled] = useState(true)
    const [useFromLastWatched, setUseFromLastWatched] = useState(true)
    const [useFromFavorited, setUseFromFavorited] = useState(true)
    const [useLastStudio, setUseLastStudio] = useState(true)
    const [count, setCount] = useState(defaultCount)
    const [settingsModal, setSettingsModalShow] = useState(false)
    function onCancelSettings() {
        setSettingsModalShow(false)
    }
    const [lastWatchWeight, setLastWatchWeight] = useState(5)
    const [favPerfWeight, setFavPerfWeight] = useState(5)
    const [lastStudioWeight, setLastStudioWeight] = useState(5)
    const [scenesToCheck, setScenesToCheck] = useState(30)
    const [includeAll, setIncludeAll] = useState(true)
    function totalWeight() {
        var total = (useFromLastWatched ? lastWatchWeight : 0) + (useFromFavorited ? favPerfWeight : 0) + (useLastStudio ? lastStudioWeight : 0)
        return total
    }
    const settingsPopup = (
        <>
        <Modal show onHide={() => onCancelSettings()} className="tags-dialog" style={{
            maxHeight: "90vh",
            height: "fit-content"
        }}>
            <Modal.Header style={{
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem"
            }}>
                <h2>Recommendation Settings</h2>
            </Modal.Header>
            <Modal.Body style={{
                overflowY: "scroll",
                maxHeight: "75vh",
                height: "fit-content",
                borderBottomLeftRadius: "1rem",
                borderBottomRightRadius: "1rem"
                }}>
            <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}
            >
            <div className="mb-3">
            <h4>Recently Watched Perfomer Recommendations</h4>
            <div className="ml-3">
            <span className="mr-3">Use Recently Watched Performers?</span>
            <Button
            className={useFromLastWatched ? "btn-success mr-2" : "btn-danger mr-2"}
            onClick={() => {
                setUseFromLastWatched(!useFromLastWatched)
            }}
            style={{
                height: "fit-content"
            }}
            >
                {useFromLastWatched ? "True" : "False"}
            </Button>
            {useFromLastWatched && lastWatchWeight/totalWeight() != 1 ? <div className="d-flex">
                <Form.Control 
                    className="lw-weight-slider w-25"
                    type="range"
                    min={0}
                    max={10}
                    value={lastWatchWeight}
                    onChange={(e) => {
                        setLastWatchWeight(Number(e.target.value))
                    }}
                />
                <span className="ml-4 d-flex align-items-center">Weight: {Math.floor(100*lastWatchWeight/totalWeight())}%</span>
            </div> : <></>}
            </div>
            </div>
            <div className="mb-3">
                <h4>Random Favorited Performer Recommendations</h4>
                <div className="ml-3">
                <span className="mr-3">Use Favorited Performers?</span>
                <Button
                className={useFromFavorited ? "btn-success mr-2" : "btn-danger mr-2"}
                onClick={() => {
                    setUseFromFavorited(!useFromFavorited)
                }}
                style={{
                    height: "fit-content"
                }}
                >
                    {useFromFavorited ? "True" : "False"}
                </Button>
                {useFromFavorited && favPerfWeight/totalWeight() != 1 ? <div className="d-flex">
                <Form.Control 
                    className="lw-weight-slider w-25"
                    type="range"
                    min={0}
                    max={10}
                    value={favPerfWeight}
                    onChange={(e) => {
                        setFavPerfWeight(Number(e.target.value))
                    }}
                />
                <span className="ml-4 d-flex align-items-center">Weight: {Math.floor(100*favPerfWeight/totalWeight())}%</span>
                </div> : <></>}
                </div>
            </div>
            <div className="mb-3">
                <h4>Random From Last Watched Studios</h4>
                <div className="ml-3">
                <span className="mr-3">Use Studios?</span>
                <Button
                className={useLastStudio ? "btn-success mr-2" : "btn-danger mr-2"}
                onClick={() => {
                    setUseLastStudio(!useLastStudio)
                }}
                style={{
                    height: "fit-content"
                }}
                >
                    {useLastStudio ? "True" : "False"}
                </Button>
                {useLastStudio && lastStudioWeight/totalWeight() != 1 ? <div className="d-flex">
                <Form.Control 
                    className="lw-weight-slider w-25"
                    type="range"
                    min={0}
                    max={10}
                    value={lastStudioWeight}
                    onChange={(e) => {
                        setLastStudioWeight(Number(e.target.value))
                    }}
                />
                <span className="ml-4 d-flex align-items-center">Weight: {Math.floor(100*lastStudioWeight/totalWeight())}%</span>
                </div> : <></>}
                </div>
            </div>
            <div className="mb-3">
                <h4>Debug Shuffle?</h4>
                <div className="ml-3">
                <Button
                className={shuffle ? "btn-success mr-2" : "btn-danger mr-2"}
                onClick={() => {
                    setShuffled(!shuffle)
                }}
                style={{
                    height: "fit-content"
                }}
                >
                    {shuffle ? "True" : "False"}
                </Button>
                </div>
            </div>
            </div>
            </Modal.Body>
        </Modal>
        </>
    )
    const RecCountOptions = ["15", "25", "50", "60"].map((o) => {
        return {
            label: o,
            value: o,
        }
    })
    
    // setCount(defaultCount)
    const RecCountSelect = useRef(null);
    const scenes:GQL.SlimSceneDataFragment[] = []
    const countObject = (array:string[], item:string) => {
        return array.filter((currentItem) => currentItem == item).length;
    }
    const calcScore = (scMax:number, scCheck:number, percent:number, tag?:any) => {
        function score() {
            return (1.57 * percent) + (.6*(scMax - scCheck)/scMax)
        }
        percent > .25 ?
        console.info(
            tag.name + 
            " Percent: " + Math.round(percent*100) + 
            " Rarity Score: " + Math.round(50*(scMax - scCheck)/scMax) + 
            " Total Score: " + score() + "   " +(score() > 1)
            ) : ""
        return score()
    }
    function checkRw() {
        var {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    per_page: scenesToCheck,
                    sort: "last_played_at",
                    direction: GQL.SortDirectionEnum.Desc
                }
            }
        })
        return data
    }
    const scenesRw = checkRw()
    const tagsRw:string[] = []
        scenesRw?.findScenes.scenes.map((scene) => {
            scene.tags.map((tag) => tagsRw.push(tag.id))
        })
    function getAllTagsBySceneCount() {
        var {data} = GQL.useFindTagsQuery({
            variables: {
                filter: {
                    per_page: -1,
                    sort: "scenes_count",
                    direction: GQL.SortDirectionEnum.Asc
                }
            }
        })
        return data ? data : undefined
    }
    const allTags = getAllTagsBySceneCount()
    // console.info(allTags)
    function isNotNull(value:any) {
        return value != "" || undefined
    }
    const totalSceneCount = useStats().data?.stats.scene_count
    console.info(totalSceneCount)
    const tagsToRec = allTags?.findTags.tags.map(
        (tag, index) => (countObject(tagsRw, tag.id) > 5 && calcScore(totalSceneCount!, tag.scene_count_all, countObject(tagsRw, tag.id)/scenesToCheck, tag) > 1? tag.id : "")
    ).filter(isNotNull)
    function tagBoolsTestDataFunc(){
        const {data} = GQL.useFindTagsQuery({variables: {ids: tagsToRec}})
        return data
    }
    const tagBoolsData = tagBoolsTestDataFunc()
    function tagBoolsFunc() {
        const data = tagBoolsData
        const tagBools = data?.findTags?.tags.map((tag, index) => (
            [tag, false] 
        ))
        return tagBools
    }
    const [tagBools, setTagBools] = useState(tagBoolsFunc())
    tagBools == undefined ? setTimeout(function(){
        setTagBools(tagBoolsFunc())
    }, 200) : ""
    function generateContent(value:string) {
        var count = Number(value)
        var lastwatchedperformers:string[] = []
        const LastWatchedStudios:string[] = []

        function getLastWatchedPerformer() {
            var {data} = GQL.useFindScenesQuery({
                variables: {
                    filter:{
                        per_page: 5,
                        sort: "last_played_at",
                        direction: GQL.SortDirectionEnum.Desc
                    }
                }
            })
            data?.findScenes.scenes.map((scene) => {
                if (scene.performers.length < 3) scene.performers.map((performer) => {
                    if (performer.gender === "FEMALE") lastwatchedperformers.push(performer.id)
                })
                
            })
            for (var i = 0; i < data?.findScenes.scenes.length!; i++) {
                data?.findScenes.scenes[i].studio ? LastWatchedStudios.push(data?.findScenes.scenes[i].studio!.id) : ""
                break
            }
        }
        function randomFromLastStudio() {
            const tagsToUsePre = tagBools?.map((tag, index) => (tagBools[index][1] ? tagBools[index][0] : "")).filter(isNotNull)
            const tagsToUse = tagsToUsePre?.map((tag) => (tag as any).id)
            var {data} = GQL.useFindScenesQuery({
                variables: {
                    filter: {
                        per_page: Math.round(count*lastStudioWeight/totalWeight()),
                        sort: "random_" + randomSeed
                    },
                    scene_filter: {
                        studios: {
                            modifier: GQL.CriterionModifier.Includes,
                            value: LastWatchedStudios
                        },
                        tags: {
                            modifier: includeAll ? GQL.CriterionModifier.IncludesAll : GQL.CriterionModifier.Includes,
                            value: tagsToUse
                        }
                    }
                }
            })
            useLastStudio ? scenes.push.apply(scenes, data?.findScenes.scenes!) : ""
        }
        function randomFromLastWatched() {
            const tagsToUsePre = tagBools?.map((tag, index) => (tagBools[index][1] ? tagBools[index][0] : "")).filter(isNotNull)
            const tagsToUse = tagsToUsePre?.map((tag) => (tag as any).id)
            var {data} = GQL.useFindScenesQuery({
                variables: {
                    filter: {
                        per_page: Math.round(count*lastWatchWeight/totalWeight()),
                        sort: "random_" + randomSeed 
                    },
                    scene_filter: {
                        performers: {
                            modifier: GQL.CriterionModifier.Includes,
                            value: lastwatchedperformers
                        },
                        tags: {
                            modifier: includeAll ? GQL.CriterionModifier.IncludesAll : GQL.CriterionModifier.Includes,
                            value: tagsToUse
                        }
                    }
                }
            })
            useFromLastWatched ? scenes.push.apply(scenes, data?.findScenes.scenes!) : ""
        }
        function getFavoritedPerformerScenes() {
            const tagsToUsePre = tagBools?.map((tag, index) => (tagBools[index][1] ? tagBools[index][0] : "")).filter(isNotNull)
            const tagsToUse = tagsToUsePre?.map((tag) => (tag as any).id)
            var {data} = GQL.useFindScenesQuery({
                variables: {
                    filter: {
                        per_page: Math.round(count*favPerfWeight/totalWeight()),
                        sort: "random_" + randomSeed,

                    },
                    scene_filter: {
                        performer_favorite: true,
                        tags: {
                            modifier: includeAll ? GQL.CriterionModifier.IncludesAll : GQL.CriterionModifier.Includes,
                            value: tagsToUse
                        }
                    }
                }
            })

            useFromFavorited ? scenes.push.apply(scenes, data?.findScenes.scenes!) : ""
        }
        getLastWatchedPerformer()
        randomFromLastWatched()
        getFavoritedPerformerScenes()
        randomFromLastStudio()
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
        const scenesUniqued = removeDuplicates(scenes)
        var shuffledScenes = scenesUniqued?.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)
        return shuffle ? shuffledScenes.slice(0,count) : scenesUniqued.slice(0,count)
    }
    var content = (
            <RecommendsGrid
            key={Math.random()}
            scenes={generateContent(count)}
            zoomIndex={2}
            />
    )
    const tagsToDisplayCont = (
        <RecommendsTags
        includeAll={includeAll}
        setIncludeAll={setIncludeAll}
        tagBools={tagBools}
        />
    )
    function render() {
        return (
            <>
                <div>
                    <div className="d-flex flex-row">
                        <div className="ml-21 d-flex flex-row mt-1" style={{width: "-webkit-fill-available"}}>
                        <Form.Control 
                            as="select"
                            ref={RecCountSelect}
                            value={count}
                            className="btn-secondary mr-2 mb-2"
                            onChange={(e) => {
                                setCount(e.target.value)
                            }}
                            style={{
                                width: "4rem"
                            }}
                        >
                            {RecCountOptions.map((s) => (
                                <option value={s.value} key={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </Form.Control>
                        {settingsModal ? settingsPopup : ""}
                        <Button 
                        className="btn-primary mr-2 mb-2"
                        onClick={() => {setSettingsModalShow(true)}}
                        style={{
                            height: "fit-content"
                        }}
                        >
                            <Icon icon={faGear} />
                        </Button>
                        <Button
                        className="btn-secondary mr-2 mb-2"
                        style={{
                            height: "fit-content"
                        }}
                        onClick={() => {
                            setRandomSeed(Math.random() * 1000000)
                        }}
                        >
                            <Icon icon={faShuffle} />
                        </Button>
                        <div style={{flexGrow: 1}} className=""></div>
                        {tagsToDisplayCont}
                        </div>
                    </div>
                </div>
                {content}
            </>
        )
    }
  return render();
};

export default RecommendationList;
