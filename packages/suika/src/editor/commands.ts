import { Rect, SceneGraph } from '../scene-graph';
import { Editor } from './editor';

type ICmdName = 'AddRect'

export class CommandManger {
  redoStack: Command[] = [];
  undoStack: Command[] = [];

  constructor(private editor: Editor) {}

  redo() {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop()!;
      this.undoStack.push(command);
      command.redo();

      this.editor.selectedElements.clear();
      this.editor.sceneGraph.render();
    }
  }
  undo() {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop()!;
      this.redoStack.push(command);
      command.undo();

      this.editor.selectedElements.clear();
      this.editor.sceneGraph.render();
    }
  }
  execCmd(cmdName: ICmdName, ...options: any[]) {
    if (cmdName === AddRectCommand.type) {
      const _options = options[0];
      // eslint-disable-next-line no-debugger
      // debugger;
      const cmd = new AddRectCommand(this.editor.sceneGraph, _options);
      this.undoStack.push(cmd);
      this.redoStack = [];
    }
  }
}

interface Command {
  redo: (...args: any) => any;
  undo: (...args: any) => any;
}

/**
 * 创建矩形
 */
class AddRectCommand implements Command {
  static readonly type = 'AddRect';
  element: Rect;
  idx = -1;

  constructor(
    private sceneGraph: SceneGraph,
    rect: Rect
  ) {
    this.element = rect;
    // 不创建 rect
  }
  redo() {
    // 往树中加上矩形对象
    this.sceneGraph.appendChild(this.element, this.idx);
  }
  undo() {
    this.idx = this.sceneGraph.removeChild(this.element);
  }
}