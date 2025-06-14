import { ButtonRenderer } from './components/ButtonRenderer';
import { FormRenderer } from './components/FormRenderer';
import { InputRenderer } from './components/InputRenderer';
import { TextRenderer } from './components/TextRenderer';
import { BlockRenderer } from './components/BlockRenderer';
import { DateRenderer } from './components/DateRenderer';

export const componentRuntimeMap: Record<string, React.ComponentType<any>> = {
  form: FormRenderer,
  button: ButtonRenderer,
  text: TextRenderer,
  input: InputRenderer,
  block: BlockRenderer,
  date: DateRenderer
};
