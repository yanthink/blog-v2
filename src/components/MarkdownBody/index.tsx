import React from 'react';
import marked from 'marked';
import DOMPurify from 'dompurify';
// @ts-ignore
import emojiToolkit from 'emoji-toolkit';
import Prism from 'prismjs';
import { getDefaultMarkedOptions, resetMarkedOptions } from '@/utils/utils';
import Tocify from './tocify';

export interface MarkdownBodyProps {
  markdown: string;
  prismPlugin?: boolean;
  toc?: boolean;
  getTocify?: (tocify: Tocify) => void;
}

class MarkdownBody extends React.Component<MarkdownBodyProps> {
  markdownBody: HTMLDivElement | any | undefined = undefined;

  tocify?: Tocify;

  constructor (props: MarkdownBodyProps) {
    super(props);

    if (props.toc) {
      this.tocify = new Tocify();
    }
  }

  componentDidMount () {
    if (this.tocify && this.props.getTocify) {
      this.props.getTocify(this.tocify);
    }

    this.runPlugin();
  }

  async componentDidUpdate (prevProps: Readonly<MarkdownBodyProps>, prevState: Readonly<{}>, snapshot?: any) {
    this.runPlugin();
  }

  componentWillUnmount () {
    resetMarkedOptions();
  }

  runPlugin = async () => {
    // https://webpack.docschina.org/guides/code-splitting/#%E5%8A%A8%E6%80%81%E5%AF%BC%E5%85%A5-dynamic-imports-
    const [{ default: jQuery }, { debounce, throttle }]: any = await Promise.all([
      import(/* webpackChunkName: 'jquery' */ 'jquery'),
      // @ts-ignore
      import(/* webpackChunkName: 'throttle-debounce' */ 'throttle-debounce'),
    ]);

    jQuery.debounce = debounce;
    jQuery.throttle = throttle;
    window.jQuery = jQuery;

    await Promise.all([
      // @ts-ignore
      import(/* webpackChunkName: 'fluidbox' */ 'fluidbox'),
      import(/* webpackChunkName: 'fluidbox' */ 'fluidbox/dist/css/fluidbox.min.css'),
    ]);

    jQuery(this.markdownBody)
      .find('img:not(.joypixels)')
      .each(function () {
        // @ts-ignore
        jQuery(this).wrap(`<a href="${jQuery(this).attr('src')}" class="fluidbox" />`);
      })
      .promise()
      .done(() => jQuery(this.markdownBody).find('a.fluidbox').fluidbox());

    if (this.props.prismPlugin) {
      jQuery(this.markdownBody).find('pre').addClass('line-numbers');
      Prism.highlightAllUnder(this.markdownBody);
    }
  };

  setMarkdownBodyRef = (ref: HTMLDivElement) => {
    this.markdownBody = ref;
  };

  replaceUserMention = (markdown = '') => {
    const reg = /@((?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]{1,10})/;
    return markdown.replace(new RegExp(reg, 'g'), '[@$1](/$1)');
  };

  createMarkup () {
    if (this.tocify) {
      this.tocify.reset();

      const { renderer, ...otherOptions } = getDefaultMarkedOptions();
      renderer.heading = (text, level) => {
        const anchor = this.tocify && this.tocify.add(text, level);
        return `<a id="${anchor}" href="#${anchor}" class="anchor-fix"><h${level}>${text}</h${level}></a>\n`;
      };
      marked.setOptions({ renderer, ...otherOptions });
    }

    const markdown = this.replaceUserMention(DOMPurify.sanitize(this.props.markdown));

    const markup = emojiToolkit.toImage(marked(markdown));

    resetMarkedOptions();

    return { __html: markup };
  }

  render () {
    return (
      <div
        ref={this.setMarkdownBodyRef}
        className="markdown-body"
        dangerouslySetInnerHTML={this.createMarkup()}
      />
    );
  }
}

export default MarkdownBody;
