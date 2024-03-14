import React, { useRef, useState } from "react";
import * as GQL from "src/core/generated-graphql";
import { faGear, faShuffle } from "@fortawesome/free-solid-svg-icons";
import { RecommendsGrid } from "./RecommendsGrid";
import { Button, Form, Modal } from "react-bootstrap";
import { Icon } from "../Shared/Icon";

interface IProps {
}

export const RecommendationList: React.FC<IProps> = ({
}) => {
    const defaultCount:string = "15"
    const [randomSeed, setRandomSeed] = useState(123456789)
    const [shuffle, setShuffled] = useState(true)
    const [useFromLastWatched, setUseFromLastWatched] = useState(true)
    const [useFromFavorited, setUseFromFavorited] = useState(true)
    const [useLastStudio, setUseLastStudio] = useState(true)
    const [count, setCount] = useState(defaultCount)
    const [lastStudio, setLastStudio] = useState(String(""))
    const [settingsModal, setSettingsModalShow] = useState(false)
    function onCancelSettings() {
        setSettingsModalShow(false)
    }
    const [lastWatchWeight, setLastWatchWeight] = useState(5)
    const [favPerfWeight, setFavPerfWeight] = useState(5)
    const [lastStudioWeight, setLastStudioWeight] = useState(5)
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
                        }
                    }
                }
            })
            useLastStudio ? scenes.push.apply(scenes, data?.findScenes.scenes!) : ""
        }
        function randomFromLastWatched() {
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
                        }
                    }
                }
            })
            useFromLastWatched ? scenes.push.apply(scenes, data?.findScenes.scenes!) : ""
        }
        function getFavoritedPerformerScenes() {
            var {data} = GQL.useFindScenesQuery({
                variables: {
                    filter: {
                        per_page: Math.round(count*favPerfWeight/totalWeight()),
                        sort: "random_" + randomSeed,

                    },
                    scene_filter: {
                        performer_favorite: true,
                        play_count: {
                            modifier: GQL.CriterionModifier.Equals,
                            value: 0
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
        var shuffledScenes = scenes.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)
        return shuffle ? shuffledScenes.slice(0,count) : scenes.slice(0,count)
    }
    var content = (
        <RecommendsGrid
        key={Math.random()}
        scenes={generateContent(count)}
        zoomIndex={2}
        />
    )
    function render() {
        return (
            <>
                <div>
                    <div className="mb-2 mr-2 d-flex flex-row">
                        <div className="mb-2 d-flex flex-row">
                        <Form.Control 
                            as="select"
                            ref={RecCountSelect}
                            value={count}
                            className="btn-secondary mr-2"
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
                        className="btn-primary mr-2"
                        onClick={() => {setSettingsModalShow(true)}}
                        style={{
                            height: "fit-content"
                        }}
                        >
                            <Icon icon={faGear} />
                        </Button>
                        <Button
                        className="btn-secondary mr-2"
                        style={{
                            height: "fit-content"
                        }}
                        onClick={() => {
                            setRandomSeed(Math.random() * 1000000)
                        }}
                        >
                            <Icon icon={faShuffle} />
                        </Button>
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
