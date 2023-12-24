import { faUser } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import * as GQL from "src/core/generated-graphql";
import { sortPerformers } from "src/core/performers";
import { HoverPopover } from "./HoverPopover";
import { Icon } from "./Icon";
import { PerformerLink } from "./TagLink";
import { isEnumType } from "graphql";

interface IProps {
  performers: Partial<GQL.PerformerDataFragment>[];
}

export const PerformerNameButton: React.FC<IProps> = ({ performers }) => {
  const sorted = sortPerformers(performers);
  const popoverContent = sorted.map((performer) => (
        performer.gender === "FEMALE" ? (<div className="d-inline-block mr-2" key={performer.id}>
        <Link
          to={`/performers/${performer.id}`}
          className="performer-name col p-0"
        >
        <span>{performer.name}</span>
        </Link>
        </div>) : (null)
        
  ));
  return (
  <>
        {popoverContent}
  </>
  );
};
