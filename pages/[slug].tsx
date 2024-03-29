import type { GetStaticPropsContext, NextPage } from "next";
import { GetStaticPaths, InferGetStaticPropsType } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { ParsedUrlQuery } from "querystring";
import { PostMeta } from "utils/types";
import { format } from "date-fns";
import { components } from "components/MdxComponents";
import rehypePrettyCode from "rehype-pretty-code";
import { options, rehypePrettyCodeStyles } from "utils/rehypePrettyCode";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import ArrowBack from "../public/arrow-back.svg";
import Link from "next/link";
import Themetoggler from "components/ThemeToggler";
import { HEADING_ANCHOR } from "utils/constants";
import Head from "next/head";

type PostProps = InferGetStaticPropsType<typeof getStaticProps>;

const Post: NextPage<PostProps> = ({ frontMatter, slug, mdxSource }) => {
  const publishedAt = new Date(frontMatter.publishedAt);

  return (
    <main className="mt-2 mb-8">
      {slug === "fashion-timeline-of-web-design" && (
        <Head>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Bitter:wght@700&family=Open+Sans:wght@400&family=Inter:wght@700&family=Space+Grotesk:wght@400&display=swap"
            rel="stylesheet"
            key="fonts"
          />
        </Head>
      )}
      <Head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      {/* <Themetoggler /> */}
      <div className="w-[100px] top-2.5 left-2.5 fixed hidden">
        <Link legacyBehavior href="/">
          <a className="flex font-['marydale'] uppercase font-bold text-xl">
            <ArrowBack className="dark:[&>g>path]:stroke-neutral-500" />
            Index
          </a>
        </Link>
      </div>
      <article className="py-16 px-4 md:px-0 md:px-10 max-w-[850px] lg:w-3/5md:w-2/3 mx-auto">
        <h1 className="uppercase text-[1.7rem] font-bold mb-6 text-center">
          {frontMatter.title}
        </h1>
        <p className="uppercase fonts-['system-ui'] text-xl font-bold mb-8 text-center">
          <time dateTime={format(publishedAt, "y-MM-dd")}>
            {format(publishedAt, "d LLLL y")}
            {` — ${frontMatter.readingTime} min read`}
          </time>
        </p>
        {frontMatter.tags && (
          <p className="uppercase fonts-['system-ui'] text-xl font-bold mb-8 text-center hidden">
            Tagged in:{" "}
            {frontMatter.tags.map(
              (tag, i) =>
                `${tag}${i + 1 !== frontMatter.tags?.length ? ", " : ""}`
            )}
          </p>
        )}
        <div className="[&>p]:indent-5 [&>p]:mb-6 [&>p]:fonts-['Source_Serif_Pro'] [&>p]:font-bold dark:text-inherit text-base md:text-lgs">
          <MDXRemote components={components} {...mdxSource} />
        </div>
      </article>
      <div className="fixed bottom-2 right-2 hidden">
        <Link legacyBehavior href="/">
          <a className="flex gap-1 hover:gap-2 transition-all px-2 py-1 text-3xl uppercase font-bold text-[#71FA4C]">
            <span>&larr;</span>
            <span>Exit</span>
          </a>
        </Link>
      </div>
    </main>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join("content/posts"));

  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace(".mdx", ""),
    },
  }));

  return {
    paths,
    fallback: false,
  };
};

type Params = ParsedUrlQuery & {
  slug: string;
};

export const getStaticProps = async (
  context: GetStaticPropsContext<Params>
) => {
  const { slug } = context.params!;

  const markdownWithMeta = fs.readFileSync(
    path.join("content/posts", slug + ".mdx"),
    "utf-8"
  );

  const { data: frontMatter, content } = matter(markdownWithMeta);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [
        [rehypePrettyCode, options],
        rehypePrettyCodeStyles,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: [HEADING_ANCHOR],
              target: "_self",
            },
          },
        ],
      ],
    },
  });

  return {
    props: {
      frontMatter: frontMatter as PostMeta,
      slug,
      mdxSource,
    },
  };
};

export default Post;
