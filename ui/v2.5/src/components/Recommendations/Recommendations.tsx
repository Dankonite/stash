import React from "react";
import { Route, Switch } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTitleProps } from "src/hooks/title";
import { PersistanceLevel } from "../List/ItemList";
import { lazyComponent } from "src/utils/lazyComponent";
import { useScrollToTopOnMount } from "src/hooks/scrollToTop";

const RecommendationList = lazyComponent(() => import("./RecommendationList"));

const Recommendations: React.FC = () => {
  useScrollToTopOnMount();

  return <RecommendationList />;
};

const RecommendationRoutes: React.FC = () => {
  const titleProps = useTitleProps({ id: "Recommendations" });
  return (
    <>
      <Helmet {...titleProps} />
      <Switch>
        <Route exact path="/Recommendations" component={Recommendations} />
      </Switch>
    </>
  );
};

export default RecommendationRoutes;
