import { ButtonRenderer } from './ButtonRenderer';
import { FormRenderer } from './FormRenderer';
import { InputRenderer } from './InputRenderer';
import { TextRenderer } from './TextRenderer';
import { BlockRenderer } from './BlockRenderer';
import { DateRenderer } from './DateRenderer';
import { ListRenderer } from './ListRenderer';
import { DialogRenderer } from './DialogRenderer';
import { ButtonFormRenderer } from './ButtonFormRenderer';

export const componentRuntimeMap: Record<string, React.ComponentType<any>> = {
  form: FormRenderer,
  button: ButtonRenderer,
  text: TextRenderer,
  input: InputRenderer,
  block: BlockRenderer,
  date: DateRenderer,
  list: ListRenderer,
  dialog: DialogRenderer,
  'button-form': ButtonFormRenderer
};
