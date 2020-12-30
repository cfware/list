import ShadowElement, {html, template, booleanAttribute, addCleanups} from '@cfware/shadow-element';
import Symbols from '@cfware/symbols';
import Debouncer from '@cfware/debouncer';
import '@cfware/button';

export const [
	colgroupTemplate,
	columnHeader,
	buttonTemplate,
	headerButtons,
	rowButton,
	rowButtons,
	rowTemplate,
	listStyle,
	listRows,
	listColumns
] = Symbols;

export default class CFWareList extends ShadowElement {
	_thead = {};
	_tbody = {};

	// get [listRows]() { return []; }
	// get [listColumns]() { return []; }

	connectedCallback() {
		super.connectedCallback();

		const resizeDebouncer = new Debouncer(() => this._onheadersize(), 33, 1);
		const resizeObserver = new ResizeObserver(() => resizeDebouncer.run());
		resizeObserver.observe(this);

		this[addCleanups](() => resizeObserver.disconnect());
	}

	_onheadersize() {
		const clearWidth = ele => {
			ele.width = '';
		};

		const thead = this._thead.current;
		const tbody = this._tbody.current;
		const heads = thead.querySelectorAll('tr:first-child th');
		const bodys = tbody.querySelectorAll('tr:first-child td');
		heads.forEach(clearWidth);
		bodys.forEach(clearWidth);

		if (!tbody.offsetWidth || bodys.length === 0) {
			return;
		}

		const scrollWidth = tbody.offsetWidth - tbody.clientWidth;
		const columns = [{className: 'minimum'}, ...this[listColumns]]
			.map(({className}, idx) => [className === 'minimum', idx])
			.sort(([a], [b]) => a === b ? 0 : (a ? -1 : 1))
			.map(([, idx]) => [
				heads[idx],
				bodys[idx],
				idx === heads.length - 1 ? scrollWidth : 0
			]);

		for (const [head, body, padding] of columns) {
			const b = body.offsetWidth;
			const h = head.offsetWidth;

			if (b > h - padding) {
				head.width = b + padding;
			} else if (h > b - padding) {
				body.width = h - padding;
			}
		}
	}

	[colgroupTemplate]() {
		const htmlNoMin = html;
		const colTemplate = col => htmlNoMin`<col class=${col.className} />`;

		return html`
			<colgroup>
				<col class=minimum />
				${this[listColumns].map(colTemplate)}
			</colgroup>
		`;
	}

	[columnHeader](column) {
		return html`<th>${column.title}</th>`;
	}

	[buttonTemplate](button) {
		if (!button) {
			return html`<cfware-button spacer />`;
		}

		const disabled = booleanAttribute(button.disabled);
		if (button.href) {
			return html`
				<a tabindex=-1 href=${new URL(button.href, window.location).href} disabled=${disabled}>
					<cfware-button class=${button.id} icon=${button.icon} disabled=${disabled} />
				</a>`;
		}

		return html`<cfware-button class=${button.id} icon=${button.icon} disabled=${disabled} onclick=${() => button.onclick(button)} />`;
	}

	[headerButtons]() {
		return [
			{id: 'create', icon: '\uF067', href: 'new/'}
		];
	}

	[rowButton](id, icon, row) {
		const {disabled, href, onclick} = row[`::${id}`] || {};
		return {
			id,
			icon,
			disabled,
			row,
			href,
			onclick
		};
	}

	[rowButtons](row) {
		return [
			this[rowButton]('delete', '\uF00D', row),
			this[rowButton]('edit', '\uF044', row)
		];
	}

	[rowTemplate](row) {
		const rowColumns = (row, column) => html`<td>${row[column.id]}</td>`;
		return html`
			<tr>
				<td class=buttons>${this[rowButtons](row).map(button => this[buttonTemplate](button))}</td>
				${this[listColumns].map(col => rowColumns(row, col))}
			</tr>
		`;
	}

	get [listStyle]() {
		return html`
			<style>
				:host {
					display: grid;
					grid-template-rows: auto 1fr;
					overflow: hidden;
				}

				.tbody {
					overflow: auto;
				}

				table {
					background: #fff;
					color: #000a;
					border-collapse: collapse;
					text-align: left;
					width: 100%;
				}

				col.minimum {
					width: 1px;
				}

				th, td {
					padding: .5rem;
					box-sizing: border-box;
					border: 1px solid #0001;
					white-space: nowrap;
				}

				th {
					background: #f2f2f2;
					border: 1px solid #0002;
					user-select: none;
				}

				tbody tr:nth-child(2n) {
					background: #fafafb;
				}

				td:first-child, th:first-child {
					border-left: none;
				}

				th.buttons, td.buttons {
					font-size: 0;
				}

				cfware-button {
					font-size: 1rem;
					border: 1px solid #0001;
					border-radius: 4px;
					--hover-background: #bbf4;
					--focus-background: #99e4;
				}

				cfware-button.create {
					--color: #A1CF64;
					--hover-color: #81BF44;
					--focus-color: #71AF34;
				}

				cfware-button.delete {
					--color: #D95C5C;
					--hover-color: #D93C3C;
					--focus-color: #E92C2C;
				}

				cfware-button.edit {
					--color: #6ECFF5;
					--hover-color: #3EAFF5;
					--focus-color: #2E9FF5;
				}
			</style>
		`;
	}

	get [template]() {
		setTimeout(() => this._onheadersize());

		const rowButtonCount = this[rowButtons]({}).length;
		const headerButtonList = this[headerButtons]();
		while (headerButtonList.length < rowButtonCount) {
			headerButtonList.push(null);
		}

		return html`
			${this[listStyle]}
			<div class=thead ref=${this._thead}>
				<table>
					${this[colgroupTemplate]()}
					<thead>
						<tr>
							<th class=buttons>${headerButtonList.map(button => this[buttonTemplate](button))}</th>
							${this[listColumns].map(col => this[columnHeader](col))}
						</tr>
					</thead>
				</table>
			</div>
			<div class=tbody ref=${this._tbody}>
				<table>
					${this[colgroupTemplate]()}
					<tbody>
						${this[listRows].map(row => this[rowTemplate](row))}
					</tbody>
				</table>
			</div>
		`;
	}
}
