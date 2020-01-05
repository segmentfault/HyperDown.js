declare class Parser {
    constructor()
    makeHtml(text: string): string
}

declare module 'hyperdown' {
    export = Parser
}