import React, { PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { PanelEditorProps } from '@grafana/data';

import { SimpleOptions } from './types';

export class BeicavieEditor extends PureComponent<PanelEditorProps<SimpleOptions>> {
  onTextChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, title: target.value });
  };

  onApiChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, api: target.value });
  };

  onApiKeyChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, apiKey: target.value });
  };

  onDeviceChanged = ({ target }: any) => {
    this.props.onOptionsChange({ ...this.props.options, device: target.value });
  };

  onModeChanged = ({ target }: any) => {
    let mode = +target.value;
    if (mode < 0 || mode > 3) {
      mode = 0;
    }
    this.props.onOptionsChange({ ...this.props.options, mode });
  };

  render() {
    const { options } = this.props;

    return (
      <div className="section gf-form-group">
        <h5 className="section-heading">Display</h5>
        <LegacyForms.FormField
          label="Title"
          labelWidth={5}
          inputWidth={20}
          type="text"
          onChange={this.onTextChanged}
          value={options.title ?? ''}
        />
        <hr />
        <LegacyForms.FormField
          label="Api"
          labelWidth={5}
          inputWidth={20}
          type="url"
          onChange={this.onApiChanged}
          value={options.api ?? ''}
        />
        <LegacyForms.FormField
          label="Api Key"
          labelWidth={5}
          inputWidth={20}
          type="text"
          onChange={this.onApiKeyChanged}
          value={options.apiKey ?? ''}
        />
        <hr />
        <LegacyForms.FormField
          label="Device"
          labelWidth={5}
          inputWidth={20}
          type="text"
          onChange={this.onDeviceChanged}
          value={options.device ?? ''}
        />
        <hr />
        <p>0 - modifica tutto</p>
        <p>1 - modifica solo descrizione bilancia</p>
        <p>2 - modifica solo numero arnie</p>
        <p>3 - modifica solo delle note</p>
        <LegacyForms.FormField
          label="Mode"
          labelWidth={5}
          inputWidth={5}
          type="number"
          onChange={this.onModeChanged}
          value={options.mode ?? '0'}
        />
      </div>
    );
  }
}
