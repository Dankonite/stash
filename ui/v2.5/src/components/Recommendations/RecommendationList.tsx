import React, { useState } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { FormattedNumber, useIntl } from "react-intl";
import { Link, useHistory } from "react-router-dom";
import Mousetrap from "mousetrap";
import * as GQL from "src/core/generated-graphql";
import { queryFindScenes, useFindScenes } from "src/core/StashService";
import {
  makeItemList,
  PersistanceLevel,
  showWhenSelected,
} from "../List/ItemList";
import { ListFilterModel } from "src/models/list-filter/filter";
import { DisplayMode } from "src/models/list-filter/types";
import { Tagger } from "../Tagger/scenes/SceneTagger";
import { IPlaySceneOptions, SceneQueue } from "src/models/sceneQueue";
import { SceneWallPanel } from "../Wall/WallPanel";
import { GenerateDialog } from "../Dialogs/GenerateDialog";
import { ExportDialog } from "../Shared/ExportDialog";
import { TaggerContext } from "../Tagger/context";
import { IdentifyDialog } from "../Dialogs/IdentifyDialog/IdentifyDialog";
import { ConfigurationContext } from "src/hooks/Config";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { objectTitle } from "src/core/files";
import TextUtils from "src/utils/text";
import { SceneCardsGrid } from "../Scenes/SceneCardsGrid";
import { SceneCard } from "../Scenes/SceneCard";

interface IProps {

}

export const RecommendationList: React.FC<IProps> = ({

}) => {
    var lastwatchedperformers:string[] = []
    var scenes:any[] = []
    function getLastWatchedPerformer() {
        const {data} = GQL.useFindScenesQuery({
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
    }
    function randomFromLastWatched() {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    per_page: 10,
                    sort: "random"
                },
                scene_filter: {
                    performers: {
                        modifier: GQL.CriterionModifier.Includes,
                        value: lastwatchedperformers
                    }
                }
            }
        })
    scenes.push.apply(scenes, data?.findScenes.scenes!)
    }
    function getFavoritedPerformerScenes() {
        const {data} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    per_page: 5,
                    sort: "random"
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
        scenes.push.apply(scenes, data?.findScenes.scenes!)
    }
    getLastWatchedPerformer()
    getFavoritedPerformerScenes()
    randomFromLastWatched()
    var Shuffled = scenes.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)
    console.info(Shuffled)
    const content = Shuffled.map((item) => (
        <>
            <div className="RecCard" key={item["id"]} style={{
                padding: "0 .75rem 0.75rem",
            }}
            >
            <Link
            to={`/scenes/${item["id"]}?sortby=random`}
            style={{
                display: "flex",
                flexDirection: "column",
                width: "fit-content",
                paddingBottom: "0.25rem",
                textDecoration: "none",
                color: "#fff",
                backgroundColor: "#202020",
                borderRadius: ".75rem",
                height: "100%"
            }}
            >
            <img
                style={{
                    height: "200px",
                    aspectRatio: "auto",
                    borderRadius: ".75rem",
                }}
                src={item["paths"]["screenshot"] ?? ""}
            >
            </img>
            <span
                style={{
                    textAlign: "center",
                    maxWidth: "355.55px",
                    fontWeight: "500",
                    fontSize: "1.1rem",
                    WebkitLineClamp: "2",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    padding: "0 0.3rem"
                }}
            >
                {item["title"]}
            </span>
            </Link>
            </div>
            </>
    ))
  return (
    <>
     <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
            }}
            >
                {content}     
            </div>
    </>
  );
};

export default RecommendationList;
