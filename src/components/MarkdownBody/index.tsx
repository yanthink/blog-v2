import React, { useEffect, useRef } from 'react';
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

const tocify = new Tocify();

const MarkdownBody: React.FC<MarkdownBodyProps> = (props) => {
  const markdownRef = useRef<HTMLDivElement | null>(null);

  const runPlugin = async () => {
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

    jQuery(markdownRef.current)
      .find('img:not(.joypixels)')
      .each(function () {
        // @ts-ignore
        jQuery(this).wrap(`<a href="${jQuery(this).attr('src')}" class="fluidbox" />`);
      })
      .promise()
      .done(() => jQuery(markdownRef.current).find('a.fluidbox').fluidbox());

    if (props.prismPlugin) {
      jQuery(markdownRef.current).find('pre').addClass('line-numbers');
      Prism.highlightAllUnder(markdownRef.current as any);
    }
  };

  useEffect(() => {
    resetMarkedOptions();

    if (props.toc && props.getTocify) {
      props.getTocify(tocify);
    }

    runPlugin();
  }, []);

  const createMarkup = () => {
    if (props.toc) {
      tocify.reset();

      const { renderer, ...otherOptions } = getDefaultMarkedOptions();
      renderer.heading = (text, level) => {
        const anchor = tocify.add(text, level);
        return `<a id="${anchor}" href="#${anchor}" class="anchor-fix"><h${level}>${text}</h${level}></a>\n`;
      };

      marked.setOptions({ renderer, ...otherOptions });
    }

    const markup = DOMPurify.sanitize(emojiToolkit.toImage(marked(props.markdown)));

    resetMarkedOptions();

    return { __html: markup };
  };

  return (
    <div ref={markdownRef} className="markdown-body" dangerouslySetInnerHTML={createMarkup()} />
  );
};

export default MarkdownBody;
