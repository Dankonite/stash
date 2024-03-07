import React from "react";
import * as GQL from "src/core/generated-graphql";
import { Button, Modal } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
interface IProps {
    scene: GQL.SlimSceneDataFragment;
    onCancel: () => void; 
}
export const TagDialog: React.FC<IProps> = ({
    scene,
    onCancel,
}) => {
    const { data, loading, error } = GQL.useFindSceneQuery({
        variables: {
           id: scene.id
        },
      });


    const tagContent = data?.findScene?.tags.map((tag) => (
        <div className="TagDialog" key={tag.id}>
            <Link
            to={`/tag/${tag.id}`}
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
                    height: "120px",
                    aspectRatio: "auto",
                    borderRadius: ".75rem",
                }}
                src={tag.image_path ?? ""}
            >
            </img>
            <span
                style={{
                    textAlign: "center"
                }}
            >
                {tag.name}
            </span>
            </Link>
        </div>
    ))
    return (
        <>
        <Modal show onHide={() => onCancel()} className="tags-dialog">
            <Modal.Header style={{
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem"
            }}>
                <div>
                    Tags
                </div>
                <Button variant="secondary" onClick={() => onCancel()}>
                    <FormattedMessage id="actions.close" />
                </Button>
            </Modal.Header>
            <Modal.Body>
            <div
            key={scene.id}
            style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
            }}
            >
                {tagContent}
            </div>
            </Modal.Body>
            <Modal.Footer style={{
                borderBottomLeftRadius: "1rem",
                borderBottomRightRadius: "1rem"
            }}>
                <Button variant="secondary" onClick={() => onCancel()}>
                    <FormattedMessage id="actions.close" />
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    );
}