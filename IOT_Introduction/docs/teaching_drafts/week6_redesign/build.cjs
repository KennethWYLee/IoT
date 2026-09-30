require('../../../scripts/build_cumulative_lesson.cjs').build(6).catch(error=>{console.error(error);process.exitCode=1;});
