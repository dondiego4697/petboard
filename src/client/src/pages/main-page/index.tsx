import * as React from 'react';
import {inject} from 'mobx-react';

import {ClientDataModel} from 'client/models/client-data';
import bevis from 'client/lib/bevis';

import './index.scss';

interface Props {
    clientDataModel?: ClientDataModel;
}

const b = bevis('main-page');

@inject('clientDataModel')
export class MainPage extends React.Component<Props> {
	public render(): React.ReactNode {
		return (
  			<div className={b()}>
  				<div className={b('container')}>
  					<h2>Main page</h2>
				</div>
			</div>
		);
	}
}
