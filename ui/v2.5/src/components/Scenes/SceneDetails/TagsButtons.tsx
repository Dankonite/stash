import React from "react";
import * as GQL from "src/core/generated-graphql";
import { Button, Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import { queryFindTagsByIDForSelect } from "src/core/StashService";
import { TagLink } from "src/components/Shared/TagLink";
interface IProps {
    scene: GQL.SceneDataFragment;
}

export const TagButtons: React.FC<IProps> = ({
    scene,
}) => {
    const ids: string[] = []
    scene.tags.forEach((tag) => {ids.push(tag.id)})
    // console.info(ids)
    const {data} = GQL.useFindTagsQuery({variables: {ids: ids}})
    // console.info(data?.findTags.tags)
    const tagContent = data?.findTags.tags.map( (tag) => (
            <>
            <div className="h-fc" key={tag.id}>
            <Link
            to={`/tags/${tag.id}?sortby=random`}
            style={{
                display: "flex",
                flexDirection: "column",
                width: "fit-content",
                padding: "0 .75rem",
                paddingBottom: "0.25rem",
                textDecoration: "none",
                color: "#fff",
                borderRadius: ".2rem",
                backgroundColor: "#202020",
                margin: "0 .2rem .4rem"
            }}
            >
            <span
                style={{
                    textAlign: "center",
                }}
            >
                {tag.name}
            </span>
            </Link>
            </div>
            </>
    ))
    return (
        <>
                {tagContent}     
        </>
    );
}