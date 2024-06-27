import React, { useMemo } from "react";
import { TagLink } from "src/components/Shared/TagLink";
import { DetailItem } from "src/components/Shared/DetailItem";
import * as GQL from "src/core/generated-graphql";
import { Tab, Tabs } from "react-bootstrap";
import { useIntl } from "react-intl";
import { useToast } from "src/hooks/Toast";
import { useHistory } from "react-router-dom";
import { Counter } from "src/components/Shared/Counter";

interface ITagDetails {
  tag: GQL.TagDataFragment;
  fullWidth?: boolean;
  tabKey: TabKey;

}
interface ITagParams {
  id: string;
  tab?: string;
}
const validTabs = [
  "default",
  "scenes",
  "galleries",
  "images",
  "performers",
  "markers",
] as const;
type TabKey = (typeof validTabs)[number];
const defaultTab: TabKey = "default";

export const TagDetailsPanel: React.FC<ITagDetails> = ({ tag, fullWidth, tabKey }) => {
  const populatedDefaultTab = useMemo(() => {
    let ret: TabKey = "scenes";
    if (tag.scene_count == 0) {
      if (tag.gallery_count != 0) {
        ret = "galleries";
      } else if (tag.image_count != 0) {
        ret = "images";
      } else if (tag.scene_marker_count != 0) {
        ret = "markers";
      }
    }
  
    return ret;
  }, [tag]);
  const Toast = useToast();
  const history = useHistory();
  const intl = useIntl();
  function isTabKey(tab: string): tab is TabKey {
    return validTabs.includes(tab as TabKey);
  }
  if (tabKey === defaultTab) {const defaultTab: TabKey = "default";

  tabKey = populatedDefaultTab;
}
function setTabKey(newTabKey: string | null) {
  if (!newTabKey || newTabKey === defaultTab) newTabKey = populatedDefaultTab;
  if (newTabKey === tabKey) return;

  if (newTabKey === populatedDefaultTab) {
    history.replace(`/tags/${tag.id}`);
  } else if (isTabKey(newTabKey)) {
    history.replace(`/tags/${tag.id}/${newTabKey}`);
  }
}
  function renderParentsField() {
    if (!tag.parents?.length) {
      return;
    }
    
    return (
      <>
        {tag.parents.map((p) => (
          <TagLink
            key={p.id}
            tag={p}
            hoverPlacement="bottom"
            linkType="details"
            showHierarchyIcon={p.parent_count !== 0}
            hierarchyTooltipID="tag_parent_tooltip"
          />
        ))}
      </>
    );
  }

  function renderChildrenField() {
    if (!tag.children?.length) {
      return;
    }

    return (
      <>
        {tag.children.map((c) => (
          <TagLink
            key={c.id}
            tag={c}
            hoverPlacement="bottom"
            linkType="details"
            showHierarchyIcon={c.child_count !== 0}
            hierarchyTooltipID="tag_sub_tag_tooltip"
          />
        ))}
      </>
    );
  }
  function maybeRenderZeroScenes() {
    const scenesCount = tag.scene_count
    if (scenesCount === 0) {
      return (
      <Tab
      eventKey="scenes"
      title={
        <>
          {intl.formatMessage({ id: "scenes" })}
          <Counter
            count={tag.scene_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderZeroImages() {
    const imagesCount = tag.image_count
    if (imagesCount === 0) {
      return (
      <Tab
      eventKey="images"
      title={
        <>
          {intl.formatMessage({ id: "images" })}
          <Counter
            count={tag.image_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderZeroGaleries() {
    const galleriesCount = tag.gallery_count
    if (galleriesCount === 0) {
      return (
        <Tab
          className="tabZeroes"
          eventKey="galleries"
          title={
        <>
          {intl.formatMessage({ id: "galleries" })}
          <Counter
            count={tag.gallery_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderZeroMarkers() {
    const markerCount = tag.scene_marker_count
    if (markerCount === 0) {
      return (
        <Tab
        eventKey="markers"
        title={
          <>
            {intl.formatMessage({ id: "markers" })}
            <Counter
              count={tag.scene_marker_count}
              hideZero
            />
          </>
        }
      >
      </Tab>
      )
    } return
  }
  function maybeRenderZeroPerformers() {
    const performerCount = tag.performer_count
    if (performerCount === 0) {
      return (
        <Tab
          className="tabZeroes"
          eventKey="performers"
          title={
        <>
          {intl.formatMessage({ id: "performers" })}
          <Counter
            count={tag.performer_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderGaleries() {
    const galleriesCount = tag.gallery_count
    if (galleriesCount !== 0) {
      return (
        <Tab
          eventKey="galleries"
          title={
        <>
          {intl.formatMessage({ id: "galleries" })}
          <Counter
            count={tag.gallery_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderScenes() {
    const scenesCount = tag.scene_count
    if (scenesCount !== 0) {
      return (
      <Tab
      eventKey="scenes"
      title={
        <>
          {intl.formatMessage({ id: "scenes" })}
          <Counter
            count={tag.scene_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderImages() {
    const imagesCount = tag.image_count
    if (imagesCount !== 0) {
      return (
      <Tab
      eventKey="images"
      title={
        <>
          {intl.formatMessage({ id: "images" })}
          <Counter
            count={tag.image_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderMarkers() {
    const markerCount = tag.scene_marker_count
    if (markerCount !== 0) {
      return (
      <Tab
      
      eventKey="markers"
      title={
        <>
          {intl.formatMessage({ id: "markers" })}
          <Counter
            count={tag.scene_marker_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    } return
  }
  function maybeRenderPerformers() {
    const performerCount = tag.performer_count
    if (performerCount !== 0) {
      return (
        <Tab
        eventKey="performers"
        title={
          <>
            {intl.formatMessage({ id: "performers" })}
            <Counter
              count={tag.performer_count}
              hideZero
            />
          </>
        }
      >
      </Tab>
      )
    } return
  }
  return (
    <>
    <div className="detail-group">
      <DetailItem
        id="description"
        value={tag.description}
        fullWidth={fullWidth}
      />
      <DetailItem
        id="parent_tags"
        value={renderParentsField()}
        fullWidth={fullWidth}
      />
      <DetailItem
        id="sub_tags"
        value={renderChildrenField()}
        fullWidth={fullWidth}
      />
    </div>
    <div className={"custom-nav-tabs"} style={{
      display: "inline-flex",
    }}>
      <Tabs
      id="performer-tabs"
      mountOnEnter
      unmountOnExit
      activeKey={tabKey}
      onSelect={setTabKey}
      >
      {maybeRenderScenes()}
      {maybeRenderGaleries()}
      {maybeRenderImages()}
      {maybeRenderMarkers()}
      {maybeRenderPerformers()}
      </Tabs>
      <Tabs
      id="performer-tabs"
      unmountOnExit
      activeKey={tabKey}
      onSelect={setTabKey}
      >
      {maybeRenderZeroScenes()}
      {maybeRenderZeroGaleries()}
      {maybeRenderZeroImages()}
      {maybeRenderZeroMarkers()}
      {maybeRenderZeroPerformers()}
      </Tabs>
    </div>
    </>
  );
};

export const CompressedTagDetailsPanel: React.FC<ITagDetails> = ({ tag, tabKey }) => {
  // Network state
  const Toast = useToast();
  const history = useHistory();
  const intl = useIntl();
  function isTabKey(tab: string): tab is TabKey {
    return validTabs.includes(tab as TabKey);
  }
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  
  function maybeRenderZeroScenes() {
    const scenesCount = tag.scene_count
    if (scenesCount === 0) {
      return (
      <Tab
      eventKey="scenes"
      title={
        <>
          {intl.formatMessage({ id: "scenes" })}
          <Counter
            count={tag.scene_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderZeroImages() {
    const imagesCount = tag.scene_count
    if (imagesCount === 0) {
      return (
      <Tab
      eventKey="images"
      title={
        <>
          {intl.formatMessage({ id: "images" })}
          <Counter
            count={tag.image_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderZeroGaleries() {
    const galleriesCount = tag.gallery_count
    if (galleriesCount === 0) {
      return (
        <Tab
          className="tabZeroes"
          eventKey="galleries"
          title={
        <>
          {intl.formatMessage({ id: "galleries" })}
          <Counter
            count={tag.gallery_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderZeroMarkers() {
    const markerCount = tag.scene_marker_count
    if (markerCount === 0) {
      return (
        <Tab
        eventKey="markers"
        title={
          <>
            {intl.formatMessage({ id: "markers" })}
            <Counter
              count={tag.scene_marker_count}
              hideZero
            />
          </>
        }
      >
      </Tab>
      )
    } return
  }
  function maybeRenderZeroPerformers() {
    const performerCount = tag.performer_count
    if (performerCount === 0) {
      return (
        <Tab
          className="tabZeroes"
          eventKey="performers"
          title={
        <>
          {intl.formatMessage({ id: "performers" })}
          <Counter
            count={tag.performer_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderGaleries() {
    const galleriesCount = tag.gallery_count
    if (galleriesCount !== 0) {
      return (
        <Tab
          eventKey="galleries"
          title={
        <>
          {intl.formatMessage({ id: "galleries" })}
          <Counter
            count={tag.gallery_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderScenes() {
    const scenesCount = tag.scene_count
    if (scenesCount !== 0) {
      return (
      <Tab
      eventKey="scenes"
      title={
        <>
          {intl.formatMessage({ id: "scenes" })}
          <Counter
            count={tag.scene_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderImages() {
    const imagesCount = tag.image_count
    if (imagesCount !== 0) {
      return (
      <Tab
      eventKey="images"
      title={
        <>
          {intl.formatMessage({ id: "images" })}
          <Counter
            count={tag.image_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    }
    return 
  }
  function maybeRenderMarkers() {
    const markerCount = tag.scene_marker_count
    if (markerCount !== 0) {
      return (
      <Tab
      
      eventKey="markers"
      title={
        <>
          {intl.formatMessage({ id: "markers" })}
          <Counter
            count={tag.scene_marker_count}
            hideZero
          />
        </>
      }
      >
    </Tab>
      )
    } return
  }
  function maybeRenderPerformers() {
    const performerCount = tag.performer_count
    if (performerCount !== 0) {
      return (
        <Tab
        eventKey="performers"
        title={
          <>
            {intl.formatMessage({ id: "performers" })}
            <Counter
              count={tag.performer_count}
              hideZero
            />
          </>
        }
      >
      </Tab>
      )
    } return
  }
  return (
    <div className="sticky detail-header">
      <div className="sticky detail-header-group">
        <a className="tag-name" onClick={() => scrollToTop()}>
          {tag.name}
        </a>
        {tag.description ? (
          <>
            <span className="detail-divider">/</span>
            <span className="tag-desc">{tag.description}</span>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
