import React from "react";
import * as GQL from "src/core/generated-graphql";
import { Button, Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import { queryFindTagsByIDForSelect } from "src/core/StashService";
interface IProps {
    scene: GQL.SceneDataFragment;
}

export const PerformerButtons: React.FC<IProps> = ({
    scene,
}) => {
    const PerfContent = scene.performers.map( (performer) => (
            <>
            <div className="TagDialog" key={performer.id}>
            <Link
            to={`/performers/${performer.id}?sortby=random`}
            style={{
                display: "flex",
                flexDirection: "column",
                width: "fit-content",
                padding: "0 .75rem",
                paddingBottom: "0.25rem",
                textDecoration: "none",
                color: "#fff"
            }}
            >
            <img
                style={{
                    height: "350px",
                    aspectRatio: "auto",
                    borderRadius: ".75rem",
                }}
                src={performer.image_path ?? ""}
            >
            </img>
            <span
                style={{
                    textAlign: "center"
                }}
            >
                {performer.name}
            </span>
            </Link>
            </div>
            </>
    ))
    return (
        <>
            <div
            key={scene.id}
            style={{
                display: "flex",
                flexWrap: "nowrap",
                justifyContent: "center",
            }}
            >
                {PerfContent}     
            </div>
        </>
    );
}