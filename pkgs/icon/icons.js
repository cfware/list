import ShadowElement, {html, template, css, adoptedStyleSheets, adoptDocumentStyleSheets, define, reflectStringProperties} from '@cfware/shadow-element';

adoptDocumentStyleSheets(css`
    @font-face {
        font-family: 'CFWare Icons';
        font-style: normal;
        font-weight: 900;
        font-display: auto;
        src: url("data:font/woff2;base64,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") format("woff2");
    }
`);

class CFWareIcon extends ShadowElement {
    static [adoptedStyleSheets] = [
        css`
            :host {
                display: inline;
                font-family: 'CFWare Icons';
                font-weight: 900;
                user-select: none;
                cursor: default;
            }
        `
    ];

    get [template]() {
        return html`${this.icon}`;
    }
}

reflectStringProperties(CFWareIcon, {icon: ''});
CFWareIcon[define]('cfware-icon');
