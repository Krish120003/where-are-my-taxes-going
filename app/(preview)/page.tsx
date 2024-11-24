"use client";

import { Input } from "@/components/ui/input";
import { Message } from "ai";
import { useCompletion } from "ai/react";
import { useEffect, useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown, { Options } from "react-markdown";
import React from "react";
import ProjectOverview from "@/components/project-overview";
import { LoadingIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Chat() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({
      onError: (error) => {
        toast.error("You've been rate limited, please try again later!");
      },
    });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (completion.length > 0) setIsExpanded(true);
  }, [completion]);

  const awaitingResponse = useMemo(() => {
    if (isLoading) {
      return true;
    } else {
      return false;
    }
  }, [isLoading, completion]);

  const lastAssistantMessage = completion;
  const userQuery: string | undefined = input;
  return (
    <div className="flex justify-center items-start sm:pt-16 min-h-screen w-full bg-[#f7efcd] px-4 md:px-0 py-4">
      <div className="absolute flex items-center gap-4 bottom-4 left-4">
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 bg-blue-500 rounded-full opacity-75 animate-ping"></div>
          <div className="relative w-full h-full bg-blue-600 rounded-full"></div>
        </div>
        <p>Last updated 2024-11-24 3:07 AM with 5537 records</p>
      </div>

      <div className="grid w-full grid-cols-12 gap-16 p-16">
        {/* <ProjectOverview /> */}
        <div className="col-span-4">
          <h1 className="w-full pb-4 text-6xl italic font-bluu">Taxplore</h1>
          <p className="w-full mb-4 -mt-2 font-serif text-2xl text-balance">
            Find where your taxes are going
          </p>
          <p>
            The government of Canada pubilshes all their tender contracts data
            on the{" "}
            <a href="https://buyandsell.gc.ca" className="text-blue-500">
              Buy and Sell
            </a>{" "}
            platform. This data is a goldmine of information about how the
            government spends our tax dollars.
          </p>
          <br />
          <p>
            This tool searches through the data to find the most relevant
            information for you. Just ask a question and I'll do my best to find
            the answer.
          </p>
          <br />
          <p>
            <strong>Disclaimer:</strong> This tool uses{" "}
            <a>Meta's LLAMA 3.1 LLM model</a> to generate responses. The
            information provided may not be accurate, so be sure to verify the
            information yourself before making any decisions.
          </p>
        </div>
        <motion.div
          animate={{
            minHeight: isExpanded ? 200 : 0,
            padding: isExpanded ? 12 : 0,
          }}
          transition={{
            type: "spring",
            bounce: 0.5,
          }}
          className={cn(
            "rounded-lg w-full col-span-8",
            isExpanded ? "bg-neutral-800" : "bg-transparent"
          )}
        >
          <div className="flex flex-col justify-between w-full gap-2">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                className={`text-base w-full  bg-neutral-700 placeholder:text-neutral-400 text-neutral-300`}
                minLength={3}
                required
                value={input}
                placeholder={"Ask me anything..."}
                onChange={handleInputChange}
              />
            </form>
            <motion.div
              transition={{
                type: "spring",
              }}
              className="flex flex-col gap-2 min-h-fit"
            >
              <AnimatePresence>
                {isLoading ? (
                  <div className="px-2 min-h-12">
                    <div className="mb-1 text-sm text-neutral-500 w-fit">
                      {/* {userQuery.content} */}
                      {userQuery}
                    </div>
                  </div>
                ) : lastAssistantMessage ? (
                  <div className="px-2 min-h-12">
                    <div className="mb-1 text-sm dark:text-neutral-400 text-neutral-500 w-fit">
                      {userQuery}
                    </div>
                    <AssistantMessage message={lastAssistantMessage} />
                  </div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const AssistantMessage = ({ message }: { message: string }) => {
  if (message === undefined) return "HELLO";
  const id = useId();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="overflow-hidden font-mono text-sm whitespace-pre-wrap anti text-neutral-800 dark:text-neutral-200"
        id="markdown"
      >
        <MemoizedReactMarkdown
          className={"max-h-96 overflow-y-scroll no-scrollbar-gutter"}
        >
          {message}
        </MemoizedReactMarkdown>
      </motion.div>
    </AnimatePresence>
  );
};

const Loading = ({ tool }: { tool?: string }) => {
  const toolName =
    tool === "getInformation"
      ? "Getting information"
      : tool === "addResource"
      ? "Adding information"
      : "Thinking";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring" }}
        className="flex items-center justify-start overflow-hidden"
      >
        <div className="flex flex-row items-center gap-2">
          <div className="animate-spin dark:text-neutral-400 text-neutral-500">
            <LoadingIcon />
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            {toolName}...
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const MemoizedReactMarkdown: React.FC<Options> = React.memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);
