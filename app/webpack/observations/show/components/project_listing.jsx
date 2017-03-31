import _ from "lodash";
import React, { PropTypes } from "react";
import { Dropdown, MenuItem, Panel } from "react-bootstrap";
import ObservationFieldValue from "./observation_field_value";

class ProjectListing extends React.Component {
  constructor( ) {
    super( );
    this.state = { fieldsPanelOpen: false };
    this.settingsMenu = this.settingsMenu.bind( this );
  }

  settingsMenu( po ) {
    const currentUser = this.props.config && this.props.config.currentUser;
    let menuItems = [];
    if ( currentUser.id === this.props.observation.user.id ) {
      const allowsAccess = po.preferences && po.preferences.allows_curator_coordinate_access;
      menuItems.push( ( <div key={ `project-allow-${po.project.id}` } className="allow">
        <input
          type="checkbox"
          defaultChecked={ allowsAccess }
          id={ `project-allow-input-${po.project.id}` }
          onClick={ ( ) => {
            this.props.updateCuratorAccess( po, allowsAccess ? 0 : 1 );
          }}
        />
        <label htmlFor={ `project-allow-input-${po.project.id}` }>
          Allow curator Access
        </label>
        <div className="text-muted">
          Allow curator access to view the private coordinates of this observation
        </div>
      </div> ) );
      menuItems.push( ( <MenuItem divider key="project-allow-divider" /> ) );
    }
    if ( !po.current_user_is_member ) {
      menuItems.push( ( <MenuItem
        key={ `project-join-${po.project.id}` }
        eventKey="join"
      >
        Join this project
      </MenuItem> ) );
    }
    menuItems.push( ( <MenuItem
      key={ `project-remove-${po.project.id}` }
      eventKey="delete"
    >
      Remove from project
    </MenuItem> ) );
    if ( po.current_user_is_member ) {
      menuItems.push( ( <MenuItem
        key={ `project-settings-${po.project.id}` }
        eventKey="projectSettings"
        href={ `/projects/${po.project.slug}/contributors/${currentUser.login}` }
      >
        Edit your settings for this project
      </MenuItem> ) );
    }
    menuItems.push( ( <MenuItem
      key={ `project-global-${po.project.id}` }
      eventKey="globalSettings"
      href="/users/edit#projects"
    >
      Edit your global project settings
    </MenuItem> ) );
    return (
      <span className="control-group">
        <Dropdown
          id="grouping-control"
          onSelect={ ( event, key ) => {
            if ( key === "join" ) {
              this.props.joinProject( po.project );
            } else if ( key === "delete" ) {
              this.props.removeFromProject( po.project );
            }
          } }
        >
          <Dropdown.Toggle noCaret>
            <i className="fa fa-cog" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-right">
            { menuItems }
          </Dropdown.Menu>
        </Dropdown>
      </span>
    );
  }

  render( ) {
    let observationFieldLink;
    let observationFields;
    const po = this.props.projectObservation;
    const observation = this.props.observation;
    const config = this.props.config;
    const viewerIsObserver = config && config.currentUser &&
      config.currentUser.id === observation.user.id;
    const viewerIsAdder = config && config.currentUser &&
      config.currentUser.id === po.user_id;
    const fields = po.project.project_observation_fields;
    if ( fields && fields.length > 1 ) {
      const fieldIDs = po.project.project_observation_fields.
        map( pof => ( pof.observation_field.id ) );
      const projectFieldValues = _.filter( observation.ofvs, ofv => (
        _.includes( fieldIDs, ofv.field_id ) ) );
      if ( projectFieldValues.length > 0 ) {
        observationFieldLink = (
          <span
            className="fieldLink"
            onClick={ ( ) => this.setState( { fieldsPanelOpen: !this.state.fieldsPanelOpen } ) }
          >
            Observation Fields <i className="fa fa-angle-double-down" />
          </span>
        );
        observationFields = (
          <Panel collapsible expanded={ this.state.fieldsPanelOpen }>
            { projectFieldValues.map( ofv => (
              <ObservationFieldValue key={ ofv.uuid } ofv={ ofv } />
            ) ) }
          </Panel>
        );
      }
    }
    return (
      <div className="projectEntry">
        <div className="project" key={ `project-${po.project.id}` }>
          <div className="image">
            <a href={ `/projects/${po.project.id}` }>
              <img src={po.project.icon} />
            </a>
          </div>
          <div className="info">
            <div className="title">
              <a href={ `/projects/${po.project.id}` }>
                { po.project.title }
              </a>
            </div>
            { observationFieldLink }
          </div>
          { viewerIsObserver || viewerIsAdder ? this.settingsMenu( po ) : "" }
        </div>
        { observationFields }
      </div>
    );
  }
}

ProjectListing.propTypes = {
  joinProject: PropTypes.func,
  removeFromProject: PropTypes.func,
  updateCuratorAccess: PropTypes.func,
  config: PropTypes.object,
  observation: PropTypes.object,
  projectObservation: PropTypes.object
};

export default ProjectListing;
