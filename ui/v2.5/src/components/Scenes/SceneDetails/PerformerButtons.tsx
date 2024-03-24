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
            <div className="" key={performer.id} style={{
            width: "120px",
            }}>
            <Link
            to={`/performers/${performer.id}?sortby=random`}
            style={{
                display: "flex",
                flexDirection: "column",
                // width: "fit-content",
                padding: "0 .75rem",
                paddingBottom: "0.25rem",
                textDecoration: "none",
                color: "#fff"
            }}
            >
            <div style={{
            height: "125px",
            width: "100px",
            overflow: "hidden",
            borderRadius: ".5rem",
            }}>
                <img
                style={{
                    height: "auto",
                    width: "100%",
                }}
                src={performer.image_path ?? ""}
                >
                </img>
            </div>
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
                {PerfContent}     
        </>
    );
}