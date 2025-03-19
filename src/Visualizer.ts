export class Visualizer {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private cfg: VisualizerConfig;

    private players: Player[] = [];
    private attacker: Player | null = null;
    private defender: Player | null = null;
    private attachedL: Player | null = null;
    private attachedR: Player | null = null;

    static readonly defaultConfig: VisualizerConfig = {
        playerRadius: 15,
        targetRadius: 18,
        pointerLength: 30,
        pointerWidth: 5,
        pointerCap: "round",
        styleAttacker: "red",
        styleDefender: "green",
        styleOther: "gray",
        styleTarget: "dimgray",
    }

    constructor(canvas: HTMLCanvasElement, cfg: Partial<VisualizerConfig> = {}) {
        // initialize canvas and context
        if (!canvas.getContext) {
            throw Error("canvas not supported");
        }
        this.canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
            throw Error("no drawing context");
        }
        this.ctx = ctx;
        // initialize config with defaults, then overwrite
        this.cfg = {...Visualizer.defaultConfig, ...cfg};
        // pose attacker and defender
        const [centerX, centerY] = [canvas.width/2, canvas.height/2];
        this.players.push({x: centerX + 2*this.cfg.playerRadius, y: centerY, t: 0});
        this.players.push({x: centerX - 2*this.cfg.playerRadius, y: centerY, t: 0});
        this.attacker = this.players[1];
        this.defender = this.players[0];
        // draw initial state
        this.update()
        // add listeners to canvas
        this.addListeners()
    }

    private addListeners() {
        this.canvas.addEventListener("mousemove", (event: MouseEvent) => {
            this.update(event);
        });
        this.canvas.addEventListener("mousedown", (event: MouseEvent) => {
            if (event.button === 0) {
                this.attachedL = this.target(event);
            } else if (event.button === 2) {
                this.attachedR = this.target(event);
            }
            this.update(event);
        });
        this.canvas.addEventListener("mouseup", (event: MouseEvent) => {
            if (event.button === 0) {
                this.attachedL = null;
            } else if (event.button === 2) {
                this.attachedR = null;
            }
            this.update(event);
        });
        this.canvas.addEventListener("mouseout", (event: MouseEvent) => {
            this.attachedL = null;
            this.attachedR = null;
            this.update(event);
        });
        this.canvas.addEventListener("contextmenu", (event: MouseEvent) => {
            event.preventDefault();
        });
    }

    private target(mouseOffset: {offsetX: number; offsetY: number}): Player | null {
        const rs = this.cfg.playerRadius**2;  // radius squared to compare against distance squared
        const pairs: {p: Player; ds: number}[] = this.players.map(p => {
            const ds = (mouseOffset.offsetX - p.x)**2 + (mouseOffset.offsetY - p.y)**2;
            return {p, ds};
        }).filter(({p, ds}) => ds <= rs);
        if (pairs.length === 0) {
            return null;
        } else {
            pairs.sort((a, b) => a.ds - b.ds);
            return pairs[0].p;
        }
    }

    private update(mouseOffset: {offsetX: number; offsetY: number} | null = null) {
        // update state
        if (this.attachedL !== null && mouseOffset !== null) {
            this.attachedL.x = mouseOffset.offsetX;
            this.attachedL.y = mouseOffset.offsetY;
        }
        if (this.attachedR !== null && mouseOffset !== null) {
            this.attachedR.t = Math.atan2(
                mouseOffset.offsetY - this.attachedR.y, mouseOffset.offsetX - this.attachedR.x
            );
        }
        // clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // draw state onto canvas
        const target = mouseOffset !== null ? this.target(mouseOffset) : null;
        for (const p of this.players) {
            // draw circle
            if (p === target) {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, this.cfg.targetRadius, 0, 2*Math.PI);
                this.ctx.fillStyle = this.cfg.styleTarget;
                this.ctx.fill();
            }
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.cfg.playerRadius, 0, 2*Math.PI);
            this.ctx.fillStyle = this.style(p);
            this.ctx.fill();
            // draw line from center towards heading
            this.ctx.lineWidth = this.cfg.pointerWidth;
            this.ctx.lineCap = this.cfg.pointerCap;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + this.cfg.pointerLength*Math.cos(p.t), p.y + this.cfg.pointerLength*Math.sin(p.t));
            this.ctx.strokeStyle = this.style(p);
            this.ctx.stroke();
        }
    }

    private style(p: Player): string {
        if (p === this.attacker) {
            return this.cfg.styleAttacker;
        } else if (p === this.defender) {
            return this.cfg.styleDefender;
        } else {
            return this.cfg.styleOther;
        }
    }
}

export type VisualizerConfig = {
    playerRadius: number;
    targetRadius: number;
    pointerLength: number;
    pointerWidth: number;
    pointerCap: "butt" | "round" | "square";
    styleAttacker: string;
    styleDefender: string;
    styleOther: string;
    styleTarget: string;
}

type Player = {
    x: number;
    y: number;
    t: number;
}
