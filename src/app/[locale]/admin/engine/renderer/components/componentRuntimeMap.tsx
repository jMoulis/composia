import { ButtonRenderer } from './ButtonRenderer';
import { FormRenderer } from './form/FormRenderer';
import { InputRenderer } from './form/InputRenderer';
import { TextRenderer } from './TextRenderer';
import { BlockRenderer } from './BlockRenderer';
import { DateRenderer } from './form/DateFormRenderer';
import { ListRenderer } from './ListRenderer';
import { DialogRenderer } from './DialogRenderer';
import { IComponentRegistryProps } from '../../interfaces';
import { SelectFormRenderer } from './form/SelectFormRenderer';
import { CheckboxFormRenderer } from './form/CheckboxFormRenderer';
import { RadioRenderer } from './form/RadioRenderer';
import { TextareaRenderer } from './form/TextareaRenderer';
import { SwitchRenderer } from './form/SwitchRenderer';
import { SliderRenderer } from './form/SliderRenderer';
import { MultiCheckboxRenderer } from './form/MultiCheckboxRenderer';

export const componentRuntimeMap: Record<
  string,
  React.ComponentType<IComponentRegistryProps>
> = {
  block: (props) => <BlockRenderer {...props} />,
  button: (props) => <ButtonRenderer {...props} />,
  checkbox: (props) => <CheckboxFormRenderer {...props} />,
  date: (props) => <DateRenderer {...props} />,
  dialog: (props) => <DialogRenderer {...props} />,
  form: (props) => <FormRenderer {...props} />,
  input: (props) => <InputRenderer {...props} />,
  list: (props) => <ListRenderer {...props} />,
  radio: (props) => <RadioRenderer {...props} />,
  select: (props) => <SelectFormRenderer {...props} />,
  switch: (props) => <SwitchRenderer {...props} />,
  text: (props) => <TextRenderer {...props} />,
  textarea: (props) => <TextareaRenderer {...props} />,
  slider: (props) => <SliderRenderer {...props} />,
  'multi-checkbox': (props) => <MultiCheckboxRenderer {...props} />
};
