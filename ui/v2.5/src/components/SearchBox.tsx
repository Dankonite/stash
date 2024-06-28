import { faTimes } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import {
    Button,
    FormControl,
} from "react-bootstrap";
import * as GQL from "src/core/generated-graphql";
import { Icon } from "./Shared/Icon";
import useFocus from "src/utils/focus";
import Fuse from "fuse.js";
import { PerformerCard } from "./Performers/PerformerCard";
import { TagCard } from "./Tags/TagCard";
import { SceneCard } from "./Scenes/SceneCard";
import { StudioCard } from "./Studios/StudioCard";
import Mousetrap from "mousetrap";
import { useHistory } from "react-router-dom";
interface SBProps {

}
export const SearchBox: React.FC<SBProps> = ({

}) => {
    const [searchTerm, setSearch] = useState("")
    const [queryRef, setQueryFocus] = useFocus();
    const [queryClearShowing, setQueryClearShowing] = useState(false);
    const history = useHistory();
    type SearchResult = { ShortName: string; TypeData: GQL.SlimSceneDataFragment | GQL.PerformerDataFragment | GQL.TagDataFragment | GQL.StudioDataFragment };
    var searchResults:SearchResult[] = []
    useEffect(() => {
        Mousetrap.bind('shift+s', (e) => {
            var SearchBox = (document.getElementById("SearchBox") as HTMLInputElement)
            if ((document.activeElement as HTMLInputElement) === SearchBox) return
            e.preventDefault();
            SearchBox?.focus();
            SearchBox.value = "";
            setSearch("");
        })
        Mousetrap.bind('escape', (e) => {
            (document.getElementById("SearchBox") as HTMLInputElement).blur();
            (document.getElementById("SearchBox") as HTMLInputElement).value = "";
            setSearch("");
        })
    })
    useEffect(() => {
        if (!searchTerm) {
          if (queryRef.current) queryRef.current.value = "";
          setQueryClearShowing(false);
        }
      }, [searchTerm, queryRef]);

    function onChangeQuery(event: React.FormEvent<HTMLInputElement>) {
        setSearch(event.currentTarget.value)
        searchResults = []
    }
    function onClearQuery() {
        if (queryRef.current) queryRef.current.value = "";
        setSearch("");
        setQueryFocus();
        setQueryClearShowing(false);
        searchResults = []
    }  
    function getSceneResults() {
        const {data, loading} = GQL.useFindScenesQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                },
                scene_filter: {
                    title: {
                        modifier: GQL.CriterionModifier.NotNull,
                        value: ""
                    }
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findScenes.count != 0) data!.findScenes.scenes.map((scene) => searchResults.push({ShortName: scene.title!, TypeData: scene }))  
        console.info("Scenes Searched...")
    }
    function getPerfResults() {
        const {data, loading} = GQL.useFindPerformersQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findPerformers.count != 0) data!.findPerformers.performers.map((perf) => searchResults.push({ShortName: perf.name, TypeData: perf }))
        console.info("Performers Searched...")
    }
    function getTagResults() {
        const {data, loading} = GQL.useFindTagsQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findTags.count != 0) data!.findTags.tags.map((tag) => searchResults.push({ShortName: tag.name, TypeData: tag }))
        console.info("Tags Searched...")
    }
    function getStudioResults() {
        const {data, loading} = GQL.useFindStudiosQuery({
            variables: {
                filter: {
                    per_page: searchTerm != "" ? 40 : 0,
                    q: searchTerm
                }
            }
        })
        if (!loading && searchTerm != "" && data?.findStudios.count != 0) data!.findStudios.studios.map((studio) => searchResults.push({ShortName: studio.name!, TypeData: studio }))
        console.info("Studios Searched...")

    }
    function getSearchResults() {
            getSceneResults()
            getTagResults()
            getPerfResults()
            getStudioResults()
            useEffect(() => {
                Mousetrap.bind('enter', (e) => {
                    if (searchTerm == "") return
                    goToFirstResult();
                    (document.getElementById("SearchBox") as HTMLInputElement).blur();
                    (document.getElementById("SearchBox") as HTMLInputElement).value = "";
                    setSearch("");
                })
            })
            const fuse = new Fuse<SearchResult>(searchResults, { keys: ['ShortName'], shouldSort: true, threshold: 0.4, });
            const fuseSearched = fuse.search(searchTerm).map(({item}) => item).slice(0,15).map((sResult) => {
                if (sResult.TypeData.__typename == "Performer") return <PerformerCard performer={sResult.TypeData} />
                if (sResult.TypeData.__typename == "Tag") return <TagCard tag={sResult.TypeData} zoomIndex={4}/>
                if (sResult.TypeData.__typename == "Scene") return <SceneCard scene={sResult.TypeData}/>
                if (sResult.TypeData.__typename == "Studio") return <StudioCard studio={sResult.TypeData}/>
            })
            function goToFirstResult() {
                const firstResult = fuse.search(searchTerm)[0].item
                history.push(`/${
                    firstResult.TypeData.__typename == "Tag" ? "tags" :
                    firstResult.TypeData.__typename == "Performer" ? "performers" :
                    firstResult.TypeData.__typename == "Scene" ? "scenes" :
                    firstResult.TypeData.__typename == "Studio" ? "studios" :
                    ""
                }/${firstResult.TypeData.id}`)
            }
            return <div className="d-flex flex-row flex-wrap">
                {fuseSearched}
            </div>
    }
    const SB = <div className="d-flex flex-row SearchBox">
        <FormControl
            ref={queryRef}
            id={"SearchBox"}
            placeholder={`Search`}
            autoComplete="off"
            defaultValue={""}
            onInput={onChangeQuery}
            className="query-text-field search-box-input bg-secondary text-white border-secondary mousetrap"
        />
        <Button
            variant="secondary"
            onClick={onClearQuery}
            className={`search-clear ${searchTerm != "" ? "" : "d-none"}`}
        >
            <Icon icon={faTimes} />
        </Button>
            <div className={`search-results ${searchTerm != "" ? "Searching" : "hide"}`}>
                {getSearchResults()}
            </div>
    </div>

    return SB
}