import { connect } from "react-redux";
import PhotoBrowser from "../components/photo_browser";
import { setMediaViewerState } from "../ducks/media_viewer";

function mapStateToProps( state ) {
  return {
    observation: state.observation
  };
}

function mapDispatchToProps( dispatch ) {
  return {
    setMediaViewerState: ( key, value ) => {
      dispatch( setMediaViewerState( key, value ) );
    }
  };
}

const PhotoBrowserContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)( PhotoBrowser );

export default PhotoBrowserContainer;
