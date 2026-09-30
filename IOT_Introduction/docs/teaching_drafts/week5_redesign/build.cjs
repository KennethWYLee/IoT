require('../../../scripts/build_cumulative_lesson.cjs').build(5).catch(error=>{console.error(error);process.exitCode=1;});
